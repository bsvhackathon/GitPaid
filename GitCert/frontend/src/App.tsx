import React, { useState, useEffect } from 'react';
import { WalletClient } from '@bsv/sdk';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [serverPublicKey, setServerPublicKey] = useState('');
  
  // Get server URL from localStorage or use default
  const defaultServerUrl = 'http://localhost:3002';
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('gitcert-server-url') || defaultServerUrl;
  });

  interface UserData {
    authenticated: boolean;
    username?: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Save server URL to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gitcert-server-url', serverUrl);
  }, [serverUrl]);
  
  // Fetch server info (public key) when the server URL changes
  useEffect(() => {
    async function fetchServerInfo() {
      try {
        const response = await fetch(`${serverUrl}/api/server-info`);
        if (response.ok) {
          const data = await response.json();
          setServerPublicKey(data.publicKey);
        } else {
          console.error('Failed to get server public key');
        }
      } catch (error) {
        console.error('Error fetching server info:', error);
      }
    }
    
    fetchServerInfo();
  }, [serverUrl]);
  
  // Fetch user data from API
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`${serverUrl}/api/user-info`, {
          credentials: 'include' // Critical for session cookies
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log("Authentication response:", data);
          setUserData(data);
        } else {
          console.log("Not authenticated:", data);
          setUserData({ authenticated: false });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({ authenticated: false });
      }
    }
    
    fetchUserData();
  }, [serverUrl]);

  const handleGitHubLogin = () => {
    // Redirect to the server's GitHub auth endpoint
    window.location.href = `${serverUrl}/auth/github`;
  };

  const handleGetCertificate = async (e: React.FormEvent) => {
    // Reset messages
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);
  
    if (!userData?.username) {
      setErrorMessage('User data is missing. Please login again.');
      setIsLoading(false);
      return;
    }
  
    try {
      // First get the GitHub auth token
      console.log('Getting auth token...');
      const tokenResponse = await fetch(`${serverUrl}/api/auth-token`, {
        credentials: 'include' // Include session cookies
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get authentication token');
      }
      
      const { token } = await tokenResponse.json();
      console.log('Got auth token:', token);
      
      const walletClient = new WalletClient('json-api');
      
      if (!serverPublicKey) {
        throw new Error('Server public key not available');
      }
      
      console.log('Current cookies: ', document.cookie);
      const result = await walletClient.acquireCertificate({
        certifier: serverPublicKey, // Use the public key from the server
        certifierUrl: serverUrl,
        type: 'Z2l0aHViLWlkZW50aXR5',
        acquisitionProtocol: 'issuance',
        fields: {
          githubUsername: String(userData.username),
          githubEmail: String(userData.email || 'not-provided'),
          token: token // Include the token in the request
        }
      });
      
      console.log('Certificate result:', result);
      setSuccessMessage(`Certificate issued successfully for ${userData.displayName || userData.username}!`);
    } catch (error) {
      console.error('Error getting certificate:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerUrl(e.target.value);
  };

  const handleLogout = () => {
    window.location.href = `${serverUrl}/logout`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-lg px-4 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white p-6 text-center">
            <h1 className="text-2xl font-bold">GitCert</h1>
            <p className="text-gray-300">GitHub Identity Certificate Authority</p>
          </div>
          
          {/* Body */}
          <div className="p-8 text-center">
            {!userData?.authenticated ? (
              // Login View
              <div>
                <div className="mb-6">
                  <img 
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                    alt="GitHub Logo" 
                    className="w-20 h-20 mx-auto mb-4"
                  />
                </div>
                
                <h2 className="text-xl font-semibold mb-3">Verify Your GitHub Identity</h2>
                <p className="text-gray-600 mb-6">
                  Authenticate with GitHub to receive a blockchain certificate 
                  that verifies your GitHub identity.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server URL
                  </label>
                  <input
                    type="url"
                    value={serverUrl}
                    onChange={handleServerUrlChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <button 
                  onClick={handleGitHubLogin}
                  className="inline-flex items-center px-5 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 01-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 010 8c0-4.42 3.58-8 8-8z"></path>
                  </svg>
                  Log in with GitHub
                </button>
              </div>
            ) : (
              // Authenticated View
              <div>
                {successMessage && (
                  <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
                    {successMessage}
                  </div>
                )}
                
                {errorMessage && (
                  <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                    {errorMessage}
                  </div>
                )}
                
                <div className="mb-6">
                  <img 
                    src={userData.avatarUrl || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full mx-auto" 
                  />
                </div>
                
                <h2 className="text-xl font-semibold mb-2">Welcome, {userData.displayName || userData.username}!</h2>
                <p className="text-gray-600 mb-6">
                  {userData.email 
                    ? `GitHub: @${userData.username} · ${userData.email}` 
                    : `GitHub: @${userData.username}`}
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server URL
                  </label>
                  <input
                    type="url"
                    value={serverUrl}
                    onChange={handleServerUrlChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server Public Key
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-xs text-gray-700 overflow-hidden text-ellipsis">
                    {serverPublicKey || 'Loading...'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    className="w-full px-5 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    onClick={handleGetCertificate}
                    disabled={isLoading || !serverPublicKey}
                  >
                    {isLoading ? 'Processing...' : 'Get GitHub Certificate'}
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full px-5 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 p-4 text-center text-gray-600 text-sm">
            <p>Certificates are issued on the BSV blockchain.</p>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-center mb-8">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h4 className="text-lg font-medium mb-2">Authenticate</h4>
              <p className="text-gray-600">Securely sign in with your GitHub account</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-lg font-medium mb-2">Verify</h4>
              <p className="text-gray-600">Verify your GitHub identity and email</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h4 className="text-lg font-medium mb-2">Certify</h4>
              <p className="text-gray-600">Receive a blockchain certificate with your identity</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 py-6 bg-gray-100">
        <div className="container mx-auto text-center text-gray-600">
          <span>GitCert &copy; 2025</span>
        </div>
      </footer>
    </div>
  );
}

export default App;