import React from 'react';
import { Wallet, AlertCircle, Github, ArrowRight, DollarSign, Check, RefreshCw, LogIn } from 'lucide-react';
import BountyDashboard from './BountyDashboard';

const BountyDashboardView: React.FC = () => {
  const {
    isLoading,
    userData,
    repositories,
    selectedRepo,
    issues,
    fundedBounties,
    serverUrl,
    notification,
    fetchRepositories,
    fetchRepoIssues,
    handleLogin,
    handleLogout,
    handleServerUrlChange,
    clearRepoSelection
  } = BountyDashboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">BSV Repository Bounties</h1>
              <p className="text-gray-300">Fund and collect bounties for open source contributions</p>
            </div>
            
            {userData?.authenticated && (
              <div className="flex items-center space-x-4">
              </div>
            )}
          </div>

          {/* Notification */}
          {notification && (
            <div className={`p-4 ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {notification.type === 'success' ? <Check className="inline mr-2" /> : <AlertCircle className="inline mr-2" />}
              {notification.message}
            </div>
          )}

          {/* Main Content */}
          {!userData?.authenticated ? (
            // Login View
            <div className="p-8 text-center">
              <Github className="w-20 h-20 mx-auto mb-6 text-gray-600" />
              
              <h2 className="text-xl font-semibold mb-4">
                Login to Access Repository Bounties
              </h2>
              
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
                onClick={handleLogin}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn className="mr-2" /> Login with GitHub
              </button>
            </div>
          ) : (
            // Authenticated View
            <div>
              {/* Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex space-x-4 px-6 py-3">
                  <button 
                    onClick={clearRepoSelection}
                    className={`px-3 py-2 ${!selectedRepo ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  >
                    Repositories
                  </button>
                  <button 
                    onClick={() => {}}
                    className={`px-3 py-2 ${false ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  >
                    My Bounties
                  </button>
                </nav>
              </div>

              {/* Repositories View */}
              {!selectedRepo ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Repositories</h2>
                    <button 
                      onClick={fetchRepositories}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  {repositories.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {isLoading ? 'Loading repositories...' : 'No repositories found'}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {repositories.map(repo => (
                        <div 
                          key={repo.id} 
                          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-2">
                                <Github className="h-5 w-5 mr-2 text-gray-500" />
                                <h3 className="font-semibold text-lg">{repo.name}</h3>
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {repo.language}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2">{repo.description}</p>
                              <div className="text-sm text-gray-500">
                                <span className="mr-4">⭐ {repo.stars} stars</span>
                                <span>{repo.issues} open issues</span>
                              </div>
                            </div>
                            <button
                              onClick={() => fetchRepoIssues(repo)}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              View Issues <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Issues View
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={clearRepoSelection}
                      className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Back to Repositories
                    </button>
                    <h2 className="text-xl font-semibold">
                      Issues for {selectedRepo.name}
                    </h2>
                  </div>

                  {issues.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {isLoading ? 'Loading issues...' : 'No open issues found'}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {issues.map(issue => (
                        <div 
                          key={issue.id} 
                          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-2">
                                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                <h3 className="font-semibold text-lg">{issue.title}</h3>
                              </div>
                              <p className="text-gray-600 mb-2">{issue.description}</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {issue.labels?.map(label => (
                                  <span 
                                    key={label} 
                                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              {issue.bounty > 0 && (
                                <div className="mb-2 flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {issue.bounty} sats
                                </div>
                              )}
                              <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Fund Bounty
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Funded Bounties View */}
              {selectedRepo === null && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">My Funded Bounties</h2>
                  
                  {fundedBounties.length === 0 ? (
                    <div className="text-center text-gray-500">
                      {isLoading ? 'Loading bounties...' : 'No funded bounties yet'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white border">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solver</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fundedBounties.map((bounty) => (
                            <tr key={bounty._id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{bounty.issueTitle}</td>
                              <td className="p-3">{bounty.repositoryName}</td>
                              <td className="p-3">{bounty.amount} sats</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  bounty.status === 'open' ? 'bg-green-100 text-green-800' :
                                  bounty.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bounty.status}
                                </span>
                              </td>
                              <td className="p-3">
                                {new Date(bounty.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                {bounty.solver?.username || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        {userData?.authenticated && (
          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-center mb-8">How BSV Repository Bounties Work</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="text-lg font-medium mb-2">Discover</h4>
              <p className="text-gray-600">Find open-source repositories with bounty opportunities</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-lg font-medium mb-2">Fund</h4>
              <p className="text-gray-600">Add bounties to specific GitHub issues</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="text-lg font-medium mb-2">Reward</h4>
              <p className="text-gray-600">Contributors get paid for solving issues</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 py-6 bg-gray-100">
        <div className="container mx-auto text-center text-gray-600">
          <span>BSV Repository Bounties &copy; 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default BountyDashboardView;