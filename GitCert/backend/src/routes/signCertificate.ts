import { Certificate, CertificateFieldNameUnder50Bytes, createNonce, MasterCertificate, Utils, verifyNonce } from '@bsv/sdk';
import { certificateFields } from '../certificates/gitCert';
import { CertifierRoute, githubTokens } from '../CertifierServer';
import { logger } from '../utils/logger';

/**
 * Route handler for certificate signing
 * This handles signCertificate for the acquireCertificate protocol
 */
export const signCertificate: CertifierRoute = {
  type: 'post',
  path: '/signCertificate',
  summary: 'Sign a new GitHub identity certificate',
  exampleBody: {
    type: 'JfRT8KzE9P6QrW5Qgpwu2LZ5NLIh0xd3VBsNv7t6s5U=',
    clientNonce: 'VhQ3UUGl4L76T9v3M2YLd/Es25CEwAAoGTowblLtM3s=',
    fields: {
      githubUsername: 'encrypted_value_here',
      githubEmail: 'encrypted_value_here'
    },
    masterKeyring: {
      githubUsername: 'encrypted_keyring_here',
      githubEmail: 'encrypted_keyring_here'
    }
  },
  exampleResponse: {
    certificate: {
      type: 'JfRT8KzE9P6QrW5Qgpwu2LZ5NLIh0xd3VBsNv7t6s5U=',
      subject: '02a1c81d78f5c404fd34c418525ba4a3b52be35328c30e67234bfcf30eb8a064d8',
      serialNumber: 'C9JwOFjAqOVgLi+lK7HpHlxHyYtNNN/Fgp9SJmfikh0=',
      fields: {
        githubUsername: 'octocat',
        githubEmail: 'octocat@github.com'
      },
      revocationOutpoint: '0000.0',
      certifier: '025384871bedffb233fdb0b4899285d73d0f0a2b9ad18062a062c01c8bdb2f720a',
      signature: '3045022100a613d9a094fac52779b29c40ba6c82e8deb047e45bda90f9b15e976286d2e3a7022017f4dead5f9241f31f47e7c4bfac6f052067a98021281394a5bc859c5fb251cc'
    },
    serverNonce: 'UFX3UUGl4L76T9v3M2YLd/Es25CEwAAoGTowblLtM3s=',
    githubUser: {
      username: 'octocat',
      email: 'octocat@github.com'
    }
  },
  func: async (req, res, server) => {
    try {
      // Get request parameters
      const { clientNonce, type, fields, masterKeyring } = req.body;
      logger.info('REQUEST fields: ', fields)

      
      // Get GitHub profile either from token or session
      let githubProfile;
      let token;
      // Check if token is provided and valid
      const entriesTemp = githubTokens.entries()
      for(const entry of entriesTemp) {
        logger.info('OOOOOOOOO: ', entry[0], entry[1])
        token = entry[0];
      }
      logger.info('HAS TOKEEEN?', token)

      if (token && githubTokens.has(token)) {
        const tokenData = githubTokens.get(token);
        if (tokenData.expires > Date.now()) {
          githubProfile = tokenData.profile;
          // Clean up the token after use
          githubTokens.delete(token);
          logger.info(`Found valid token for user: ${githubProfile.username}`);
        } else {
          // Token expired
          githubTokens.delete(token);
          logger.warn('Token expired');
        }
      }
      logger.info('GITHUB PROFILEE', githubProfile)
      
      // If no profile from token, check if authenticated through session
      if (!githubProfile) {
        if (!req.isAuthenticated()) {
          logger.warn('Unauthenticated certificate request attempt');
          res.status(401).json({
            status: 'error',
            description: 'Authentication with GitHub is required'
          });
          return;
        }
        githubProfile = req.user;
      }

      logger.info(`Certificate request from GitHub user: ${githubProfile.username}`);
      
      // Validate parameters
      try {
        server.certifierSignCheckArgs(req.body);

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid parameters';
        logger.warn(`Invalid certificate request parameters: ${message}`);
        res.status(400).json({
          status: 'error',
          description: message
        });
        return;
      }
      logger.info('Public key:', server.wallet.getPublicKey.toString())
      logger.info('CertifierSignCheckArgs good');
      logger.info('Identity key:', (req as any).auth.identityKey)
      // Verify the client actually created the provided nonce
      await verifyNonce(clientNonce, server.wallet, (req as any).auth.identityKey);
      logger.info('VerifyNonce good!');

      // Server creates a random nonce that the client can verify
      const serverNonce = await createNonce(server.wallet, (req as any).auth.identityKey);
      
      // The server computes a serial number from the client and server nonces
      const { hmac } = await server.wallet.createHmac({
        data: Utils.toArray(clientNonce + serverNonce, 'base64'),
        protocolID: [2, 'certificate issuance'],
        keyID: serverNonce + clientNonce,
        counterparty: (req as any).auth.identityKey
      });
      const serialNumber = Utils.toBase64(hmac);
      logger.info('Compute serial number good!');

      // Decrypt certificate fields
      const decryptedFields = await MasterCertificate.decryptFields(
        server.wallet,
        masterKeyring,
        fields,
        (req as any).auth.identityKey
      );
      logger.info('Decrypt certificate fields good!');

      // Set GitHub data from the user's profile
      // In a real implementation, you'd use the decrypted fields
      // For this demo, we're directly using the GitHub profile data
      decryptedFields.githubUsername = githubProfile.username;
      
      // Get the email if available
      const email = githubProfile.emails && githubProfile.emails.length > 0 
        ? githubProfile.emails[0].value 
        : '';
      
      decryptedFields.githubEmail = email;
      
      // Create a revocation outpoint
      const revocationTxid = '0000';

      // Create and sign the certificate
      const signedCertificate = new Certificate(
        type,
        serialNumber,
        (req as any).auth.identityKey,
        ((await server.wallet.getPublicKey({ identityKey: true })).publicKey),
        `${revocationTxid}.0`,
        fields // Using the encrypted fields
      );

      await signedCertificate.sign(server.wallet);

      // Log certificate issuance
      logger.info(`GitCert issued to GitHub user: ${githubProfile.username}`);

      // Return the certificate and GitHub user info
      res.status(200).json({
        certificate: signedCertificate,
        serverNonce,
        githubUser: {
          username: githubProfile.username,
          email: email
        }
      });
    } catch (e) {
      logger.error('Error in certificate issuance:', e);
      res.status(500).json({
        status: 'error',
        code: 'ERR_INTERNAL',
        description: 'An internal error has occurred.'
      });
    }
  }
};