export interface User {
    githubId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    walletBalance: number;
  }
  
  export interface Repository {
    id: number;
    name: string;
    description: string;
    stars: number;
    issues: number;
    language: string;
    url: string;
    owner: string;
    private: boolean;
    fullName: string;
  }
  
  export interface Issue {
    id: number;
    number: number;
    title: string;
    description: string;
    state: string;
    labels: string[];
    createdAt: string;
    updatedAt: string;
    url: string;
    bounty: number;
  }
  
  export interface Bounty {
    _id?: string;
    repositoryOwner: string;
    repositoryName: string;
    issueNumber: number;
    issueTitle: string;
    amount: number;
    funder: {
      githubId: string;
      username: string;
    };
    status: 'open' | 'in-progress' | 'completed' | 'cancelled';
    solver: {
      githubId: string;
      username: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
    txid?: string;
    outputIndex?: number;
  }
  
  export interface BountyTransaction {
    txid: string;
    outputIndex: number;
    amount: number;
    status: string;
  }
  
  export interface CreateBountyParams {
    repositoryOwner: string;
    repositoryName: string;
    issueNumber: number;
    issueTitle: string;
    amount: number;
  }
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
  }