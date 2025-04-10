import { authAPI } from './api';
import { User } from '../types/types';

// Helper function to handle GitHub login
export const loginWithGitHub = (): void => {
  // Redirect to GitHub OAuth endpoint
  window.location.href = '/auth/github';
};

// Check if user is authenticated
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean, user: User | null }> => {
  try {
    const response = await authAPI.getStatus();
    return {
      isAuthenticated: response.isAuthenticated,
      user: response.user || null
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await authAPI.logout();
    // Redirect to home page after logout
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get user info
export const getUserInfo = async (): Promise<User | null> => {
  try {
    const response = await authAPI.getUserInfo();
    
    if (!response.authenticated) {
      return null;
    }
    
    return {
      githubId: response.githubId || '',
      username: response.username,
      displayName: response.displayName,
      avatarUrl: response.avatarUrl,
      walletBalance: response.walletBalance || 0
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};