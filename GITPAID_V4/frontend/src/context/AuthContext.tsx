import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '../types/types';
import { checkAuthStatus, loginWithGitHub, logout as logoutUser } from '../services/auth';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  checkAuthStatus: async () => false
});

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Function to check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { isAuthenticated, user } = await checkAuthStatus();
      
      setIsAuthenticated(isAuthenticated);
      setUser(user);
      
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle login
  const login = () => {
    loginWithGitHub();
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Check authentication status on first render
  useEffect(() => {
    checkAuth();
  }, []);

  // Provide auth context to child components
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus: checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};