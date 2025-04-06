import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, Github, ArrowRight, DollarSign, Check, RefreshCw, LogIn } from 'lucide-react';
import { 
  UserData, 
  Repository, 
  Issue, 
  Bounty, 
  Notification 
} from './types';

// Define the base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function BountyDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fundedBounties, setFundedBounties] = useState<Bounty[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('bsv-bounty-server-url') || API_BASE_URL;
  });
  const [notification, setNotification] = useState<Notification | null>(null);

  // Save server URL to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bsv-bounty-server-url', serverUrl);
  }, [serverUrl]);

  // Fetch user data on component mount or server URL change
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`${serverUrl}/api/user-info`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setUserData(data);
          // Fetch additional data after authentication
          fetchRepositories();
          fetchWalletBalance();
          fetchFundedBounties();
        } else {
          setUserData({ authenticated: false });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({ authenticated: false });
      }
    }
    
    fetchUserData();
  }, [serverUrl]);

  // Fetch repositories when authenticated
  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${serverUrl}/api/repositories`, {
        credentials: 'include'
      });
      const data = await response.json();
      setRepositories(data);
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

  // Fetch issues for a selected repository
  const fetchRepoIssues = async (repo: Repository) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${serverUrl}/api/repositories/${repo.owner}/${repo.name}/issues`, {
        credentials: 'include'
      });
      const data = await response.json();
      setIssues(data);
      setSelectedRepo(repo);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch repository issues'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/wallet/balance`, {
        credentials: 'include'
      });
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // Fetch funded bounties
  const fetchFundedBounties = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/bounties/funded`, {
        credentials: 'include'
      });
      const data = await response.json();
      setFundedBounties(data);
    } catch (error) {
      console.error('Error fetching funded bounties:', error);
    }
  };

  // Handle GitHub login
  const handleLogin = () => {
    window.open(`${serverUrl}/auth/github`, '_blank');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${serverUrl}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      // Reset all states
      setUserData({ authenticated: false });
      setRepositories([]);
      setSelectedRepo(null);
      setIssues([]);
      setFundedBounties([]);
      setWalletBalance(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle server URL change
  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerUrl(e.target.value);
  };

  // Clear repository selection
  const clearRepoSelection = () => {
    setSelectedRepo(null);
    setIssues([]);
  };

  // Return state and methods for use in the view
  return {
    isLoading,
    userData,
    repositories,
    selectedRepo,
    issues,
    fundedBounties,
    walletBalance,
    serverUrl,
    notification,
    setServerUrl,
    fetchRepositories,
    fetchRepoIssues,
    handleLogin,
    handleLogout,
    handleServerUrlChange,
    clearRepoSelection
  };
}

export default BountyDashboard;