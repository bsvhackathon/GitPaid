import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Github, ArrowRight, Wallet, DollarSign, Clock, Key, RefreshCw, LogIn } from 'lucide-react';

// Define the base URL for API calls
const API_BASE_URL = 'http://localhost:8080';

const BountyDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('repos'); // repos, issues, funded
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repos, setRepos] = useState([]);
  const [issues, setIssues] = useState([]);
  const [fundedBounties, setFundedBounties] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check if the URL has an auth success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authSuccess') === 'true') {
      // Remove the query parameter from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Check auth status
      checkAuthStatus();
    } else if (urlParams.get('authError') === 'true') {
      // Handle authentication error
      setNotification({
        type: 'error',
        message: 'Authentication failed. Please try again.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check authentication status on component mount
      checkAuthStatus();
    }
  }, []);

  useEffect(() => {
    // If authenticated, fetch repositories and wallet balance
    if (isAuthenticated) {
      fetchRepositories();
      fetchWalletBalance();
      fetchFundedBounties();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // If a repository is selected, fetch its issues
    if (selectedRepo) {
      fetchIssues(selectedRepo);
    }
  }, [selectedRepo]);

  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/api/auth/status');
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to check authentication status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest('/api/repositories');
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch repositories'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIssues = async (repo) => {
    try {
      setIsLoading(true);
      const data = await apiRequest(`/api/repositories/${repo.owner}/${repo.name}/issues`);
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch issues'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const data = await apiRequest('/api/wallet/balance');
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchFundedBounties = async () => {
    try {
      const data = await apiRequest('/api/bounties/funded');
      setFundedBounties(data);
    } catch (error) {
      console.error('Error fetching funded bounties:', error);
    }
  };

  const handleLogin = () => {
    // Redirect to GitHub OAuth flow
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', 'POST');
      setIsAuthenticated(false);
      setUser(null);
      setRepos([]);
      setIssues([]);
      setFundedBounties([]);
      setWalletBalance(0);
      setSelectedRepo(null);
      setActiveView('repos');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setActiveView('issues');
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setActiveView('repos');
  };

  const handleFundIssue = (issue) => {
    setSelectedIssue(issue);
    setFundAmount(issue.bounty > 0 ? (issue.bounty / 1000).toString() : '');
    setShowFundModal(true);
  };

  const handleSubmitFunding = async () => {
    try {
      setIsLoading(true);
      const amount = parseInt(fundAmount) * 1000; // Convert to satoshis
      
      // API call to fund the bounty
      await apiRequest('/api/bounties', 'POST', {
        repositoryOwner: selectedRepo.owner,
        repositoryName: selectedRepo.name,
        issueNumber: selectedIssue.number,
        issueTitle: selectedIssue.title,
        amount
      });
      
      // Refresh issues data
      await fetchIssues(selectedRepo);
      
      // Refresh wallet balance
      await fetchWalletBalance();
      
      // Refresh funded bounties
      await fetchFundedBounties();
      
      setShowFundModal(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully funded issue with ${amount} satoshis`
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error funding issue:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to fund issue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRepos = async () => {
    await fetchRepositories();
    setNotification({
      type: 'success',
      message: 'Repositories refreshed successfully'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">BSV Repository Bounties</h1>
            <p className="text-gray-500">Fund and collect bounties for open source contributions</p>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="bg-gray-100 p-2 rounded-lg flex items-center">
                  <Wallet className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">{(walletBalance / 100000000).toFixed(8)} BSV</span>
                  <span className="text-gray-500 ml-1">({walletBalance} sats)</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation - Only show if authenticated */}
      {isAuthenticated && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-12">
              <div className="flex">
                <button 
                  onClick={() => setActiveView('repos')}
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium ${
                    activeView === 'repos' 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Repositories
                </button>
                <button 
                  onClick={() => setActiveView('funded')}
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium ${
                    activeView === 'funded' 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Funded Bounties
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-md shadow-md flex items-center ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to BSV Repository Bounties</h2>
            <p className="text-gray-600 mb-6">Connect your GitHub account to fund and manage bounties for open source issues.</p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <LogIn className="h-5 w-5 mr-2" />
              {isLoading ? 'Connecting...' : 'Login with GitHub'}
            </button>
          </div>
        ) : (
          <>
            {/* Repository view */}
            {activeView === 'repos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Your Repositories</h2>
                  <button 
                    onClick={refreshRepos}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {repos.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    {isLoading ? (
                      <p className="text-gray-500">Loading repositories...</p>
                    ) : (
                      <p className="text-gray-500">No repositories found.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    {repos.map(repo => (
                      <div key={repo.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <Github className="h-5 w-5 text-gray-400 mr-2" />
                              <h3 className="text-lg font-medium text-gray-900">{repo.name}</h3>
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {repo.language}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-600">{repo.description}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="mr-4">⭐ {repo.stars} stars</span>
                              <span>{repo.issues} open issues</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRepoSelect(repo)}
                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Issues
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Issues view */}
            {activeView === 'issues' && selectedRepo && (
              <div>
                <div className="flex items-center mb-6">
                  <button 
                    onClick={handleBackToRepos}
                    className="mr-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Issues for <span className="text-blue-600">{selectedRepo.name}</span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">Loading issues...</p>
                  </div>
                ) : issues.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">No open issues found in this repository.</p>
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    {issues.map(issue => (
                      <div key={issue.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                            </div>
                            <p className="mt-1 text-gray-600">{issue.description}</p>
                            <div className="mt-2 flex flex-wrap items-center text-sm">
                              {issue.labels && issue.labels.map(label => (
                                <span key={label} className="mr-2 mb-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end">
                            {issue.bounty > 0 && (
                              <div className="mb-2 px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>{issue.bounty} sats</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleFundIssue(issue)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {issue.bounty > 0 ? 'Update Bounty' : 'Fund Bounty'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Funded Bounties view */}
            {activeView === 'funded' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">My Funded Bounties</h2>
                
                {isLoading ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">Loading bounties...</p>
                  </div>
                ) : fundedBounties.length === 0 ? (
                  <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-500">You haven't funded any bounties yet.</p>
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solver</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fundedBounties.map((bounty) => (
                          <tr key={bounty._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bounty.issueTitle}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bounty.repositoryName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bounty.amount} sats</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${bounty.status === 'open' ? 'bg-green-100 text-green-800' : 
                                  bounty.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'}`}>
                                {bounty.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(bounty.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bounty.solver ? bounty.solver.username : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Fund Modal */}
      {showFundModal && selectedIssue && (
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowFundModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fund Bounty</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Issue:</p>
              <p className="font-medium">{selectedIssue.title}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Bounty Amount (in thousands of satoshis)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">k</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0"
                  min="1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">sats</span>
                </div>
              </div>
              {fundAmount && (
                <p className="mt-2 text-sm text-gray-500">
                  Total: {parseInt(fundAmount) * 1000} satoshis ({(parseInt(fundAmount) * 1000 / 100000000).toFixed(8)} BSV)
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowFundModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSubmitFunding}
                disabled={!fundAmount || isLoading || isNaN(parseInt(fundAmount))}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  'Fund Issue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BountyDashboard;