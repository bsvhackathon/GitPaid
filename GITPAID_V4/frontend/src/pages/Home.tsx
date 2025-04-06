import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { Bounty } from '../types/types';
import { bountyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BountyCard from '../components/BountyCard';
import WalletInfo from '../components/WalletInfo';

const Home: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch funded bounties if user is authenticated
  useEffect(() => {
    const fetchBounties = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const fundedBounties = await bountyAPI.getFundedBounties();
        setBounties(fundedBounties);
        setError(null);
      } catch (error) {
        console.error('Error fetching bounties:', error);
        setError('Failed to load bounties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && isAuthenticated) {
      fetchBounties();
    }
  }, [isAuthenticated, authLoading]);
  
  const handleCreateBounty = () => {
    navigate('/repositories');
  };
  
  const handleViewDetails = (bounty: Bounty) => {
    navigate(`/repositories/${bounty.repositoryOwner}/${bounty.repositoryName}/issues/${bounty.issueNumber}`);
  };
  
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Left column */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(66.666% - 16px)' } }}>
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to GitPaid
            </Typography>
            <Typography variant="body1" paragraph>
              Fund GitHub issues with BSV bounties and reward developers for their contributions.
            </Typography>
            
            {isAuthenticated ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<MonetizationOnIcon />}
                onClick={handleCreateBounty}
                size="large"
              >
                Fund a Bounty
              </Button>
            ) : (
              <Alert severity="info">
                Please login with GitHub to create and manage bounties.
              </Alert>
            )}
          </Paper>
          
          {isAuthenticated && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Your Bounties</Typography>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/repositories')}
                >
                  Browse Repositories
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : bounties.length === 0 ? (
                <Alert severity="info">
                  You haven't funded any bounties yet. Click "Fund a Bounty" to get started.
                </Alert>
              ) : (
                bounties.map(bounty => (
                  <BountyCard
                    key={`${bounty._id || bounty.txid}`}
                    bounty={bounty}
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </Box>
          )}
        </Box>
        
        {/* Right column */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          {isAuthenticated && <WalletInfo />}
          
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How GitPaid Works
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  1. Fund GitHub Issues
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Create bounties for open issues in GitHub repositories using BSV.
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  2. Developers Solve Issues
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Developers work on issues and submit pull requests to solve them.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  3. Reward Contributors
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  When a solution is accepted, the bounty is sent to the developer who solved it.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;