
// GitCert Certificate Type Definition
//
// A simple certificate type for GitHub identity verification
// The certificate type is assigned a unique identifier (base64 string)
// This identifier should not be reused for other certificate types

import { Base64String, CertificateFieldNameUnder50Bytes } from "@bsv/sdk"

// Certificate type ID - this is a randomly generated value
export const certificateType: Base64String = 'Z2l0aHViLWlkZW50aXR5'

// Certificate field definitions
export const certificateDefinition: Record<CertificateFieldNameUnder50Bytes, string> = {
  githubUsername: '', // GitHub username
  githubEmail: ''     // GitHub email address
}

// List of certificate fields
export const certificateFields: CertificateFieldNameUnder50Bytes[] = Object.keys(certificateDefinition)

// Field descriptions for documentation
export const fieldDescriptions: Record<string, string> = {
  githubUsername: 'The GitHub username of the certificate owner',
  githubEmail: 'The GitHub email address of the certificate owner'
}

// Certificate purpose description
export const certificatePurpose = `
The GitHub Identity Certificate (GitCert) provides blockchain-based verification of a user's 
GitHub account identity. This certificate confirms that the owner has authenticated with GitHub
and contains their verified GitHub username and email address.

This certificate can be used as a portable identity credential that is anchored to the user's 
GitHub account but stored in their own wallet, making it useful for decentralized applications
that require GitHub identity verification.
`