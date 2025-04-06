import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useNavigate } from 'react-router-dom';
import { Bounty } from '../types/types';
import { bountyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BountyCard from '../components/BountyCard';
import WalletInfo from '../components/WalletInfo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState<number>(0);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Fetch funded bounties
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
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
  
  if (!isAuthenticated || !user) {
    return null; // Redirect handled by useEffect
  }
  
  // Filter bounties by status
  const openBounties = bounties.filter(b => b.status === 'open');
  const inProgressBounties = bounties.filter(b => b.status === 'in-progress');
  const completedBounties = bounties.filter(b => b.status === 'completed');
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* User profile and wallet - left column */}
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                src={user.avatarUrl}
                alt={user.displayName}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user.displayName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                @{user.username}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
                href={`https://github.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                GitHub Profile
              </Button>
            </CardContent>
          </Card>
          
          <WalletInfo />
        </Box>
        
        {/* Bounties tabs - right column */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Bounties
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label={`Open (${openBounties.length})`} />
                <Tab label={`In Progress (${inProgressBounties.length})`} />
                <Tab label={`Completed (${completedBounties.length})`} />
              </Tabs>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              ) : (
                <>
                  <TabPanel value={tabValue} index={0}>
                    {openBounties.length === 0 ? (
                      <Alert severity="info">
                        You don't have any open bounties.
                      </Alert>
                    ) : (
                      openBounties.map(bounty => (
                        <BountyCard
                          key={`${bounty._id || bounty.txid}`}
                          bounty={bounty}
                          onViewDetails={handleViewDetails}
                        />
                      ))
                    )}
                  </TabPanel>
                  
                  <TabPanel value={tabValue} index={1}>
                    {inProgressBounties.length === 0 ? (
                      <Alert severity="info">
                        You don't have any bounties in progress.
                      </Alert>
                    ) : (
                      inProgressBounties.map(bounty => (
                        <BountyCard
                          key={`${bounty._id || bounty.txid}`}
                          bounty={bounty}
                          onViewDetails={handleViewDetails}
                        />
                      ))
                    )}
                  </TabPanel>
                  
                  <TabPanel value={tabValue} index={2}>
                    {completedBounties.length === 0 ? (
                      <Alert severity="info">
                        You don't have any completed bounties.
                      </Alert>
                    ) : (
                      completedBounties.map(bounty => (
                        <BountyCard
                          key={`${bounty._id || bounty.txid}`}
                          bounty={bounty}
                          onViewDetails={handleViewDetails}
                          showActions={false}
                        />
                      ))
                    )}
                  </TabPanel>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfilePage;