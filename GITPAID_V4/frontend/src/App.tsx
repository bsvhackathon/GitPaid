import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

// Import theme
import gitpaidTheme from './theme';

// Import components
import AppHeader from './components/AppHeader';

// Import pages
import Home from './pages/Home';
import RepositoryView from './pages/RepositoryView';
import IssueBounty from './pages/IssueBounty';
import ProfilePage from './pages/ProfilePage';

// Import services
import { lookupResolver, lookupServices } from './utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // Or a loading spinner
  }
  
  if (!isAuthenticated) {
    toast.error('Please log in to access this page');
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  
  // Check auth status on app load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('authSuccess');
    const authError = urlParams.get('authError');
    
    // Check authentication status
    checkAuthStatus();
    
    // Show toast messages for auth status
    if (authSuccess === 'true') {
      toast.success('Successfully logged in with GitHub!');
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authError === 'true') {
      toast.error('GitHub authentication failed');
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkAuthStatus]);

  // Initialize lookup service connection
  useEffect(() => {
    const initializeLookupService = async () => {
      try {
        // Test connection to lookup service
        await lookupResolver.query({
          service: lookupServices.bounty,
          query: { findAll: true }
        });
        console.log('Successfully connected to bounty lookup service');
      } catch (err) {
        console.error('Error connecting to bounty lookup service:', err);
      }
    };

    initializeLookupService();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/repositories" 
        element={
          <ProtectedRoute>
            <RepositoryView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/repositories/:owner/:repo" 
        element={
          <ProtectedRoute>
            <RepositoryView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/repositories/:owner/:repo/issues/:issueNumber" 
        element={
          <IssueBounty />
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={gitpaidTheme}>
      <CssBaseline />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router>
        <AuthProvider>
          <AppHeader />
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;