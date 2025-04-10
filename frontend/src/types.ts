export interface UserData {
    authenticated: boolean;
    username?: string;
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  }
  
  export interface Repository {
    id: number;
    name: string;
    owner: string;
    description: string;
    language: string;
    stars: number;
    issues: number;
  }
  
  export interface Issue {
    id: number;
    number: number;
    title: string;
    description: string;
    labels: string[];
    bounty: number;
  }
  
  export interface Bounty {
    _id: string;
    issueTitle: string;
    repositoryName: string;
    amount: number;
    status: string;
    createdAt: string;
    solver?: { username: string };
  }
  
  export interface Notification {
    type: 'success' | 'error';
    message: string;
  }