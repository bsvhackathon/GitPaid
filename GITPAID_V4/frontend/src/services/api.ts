import axios from 'axios';
import { 
  Repository, 
  Issue, 
  Bounty, 
  CreateBountyParams, 
  User
} from '../types/types';

// Create axios instance with common configs
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important to send cookies with requests
});

// Auth-related API calls
export const authAPI = {
  getStatus: async () => {
    const response = await api.get<{ isAuthenticated: boolean, user?: User }>('/auth/status');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getUserInfo: async () => {
    const response = await api.get<{ authenticated: boolean } & User>('/user-info');
    return response.data;
  }
};

// Repository-related API calls
export const repoAPI = {
  getRepositories: async () => {
    const response = await api.get<Repository[]>('/repositories');
    return response.data;
  },
  
  getIssues: async (owner: string, repo: string) => {
    const response = await api.get<Issue[]>(`/repositories/${owner}/${repo}/issues`);
    return response.data;
  }
};

// Bounty-related API calls
export const bountyAPI = {
  createBounty: async (bountyData: CreateBountyParams) => {
    const response = await api.post<Bounty>('/bounties', bountyData);
    return response.data;
  },
  
  getFundedBounties: async () => {
    const response = await api.get<Bounty[]>('/bounties/funded');
    return response.data;
  },
  
  getWalletBalance: async () => {
    const response = await api.get<{ balance: number }>('/wallet/balance');
    return response.data;
  },
  
  // Add future endpoints here like claiming bounties, etc.
};

// Blockchain-related API calls using the BSV overlay network
export const overlayAPI = {
  getIssueStatus: async (owner: string, repo: string, issueNumber: number) => {
    try {
      // Use the lookup resolver to query the bounty lookup service
      // This would be implemented using the LookupResolver from BSV SDK
      // Similar to how the Meter example queries its lookup service
      return { success: true };
    } catch (error) {
      console.error('Error querying overlay network:', error);
      throw error;
    }
  }
};

export default api;