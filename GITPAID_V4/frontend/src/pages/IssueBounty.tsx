import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Issue, Repository, Bounty } from '../types/types';
import { repoAPI, bountyAPI } from '../services/api';
import BountyForm from '../components/BountyForm';
import WalletInfo from '../components/WalletInfo';
import BountyCard from '../components/BountyCard';
import { useAuth } from '../context/AuthContext';

const IssueBounty: React.FC = () => {
  const { owner, repo, issueNumber } = useParams<{ owner: string; repo: string; issueNumber: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [repository, setRepository] = useState<Repository | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Fetch repository and issue details
  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repo || !issueNumber) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch repositories
        const repos = await repoAPI.getRepositories();
        const foundRepo = repos.find(r => 
          r.owner.toLowerCase() === owner.toLowerCase() && 
          r.name.toLowerCase() === repo.toLowerCase()
        );
        
        if (!foundRepo) {
          setError('Repository not found');
          setLoading(false);
          return;
        }
        
        setRepository(foundRepo);
        
        // Fetch issues for the repository
        const issues = await repoAPI.getIssues(owner, repo);
        const issueId = parseInt(issueNumber);
        const foundIssue = issues.find(i => i.number === issueId);
        
        if (!foundIssue) {
          setError('Issue not found');
          setLoading(false);
          return;
        }
        
        setIssue(foundIssue);
        
        // If issue has a bounty, fetch bounty details
        if (foundIssue.bounty > 0) {
          try {
            const fundedBounties = await bountyAPI.getFundedBounties();
            const foundBounty = fundedBounties.find(b => 
              b.repositoryOwner.toLowerCase() === owner.toLowerCase() &&
              b.repositoryName.toLowerCase() === repo.toLowerCase() &&
              b.issueNumber === issueId
            );
            
            if (foundBounty) {
              setBounty(foundBounty);
            }
          } catch (error) {
            console.error('Error fetching bounty details:', error);
            // Continue even if bounty details fetch fails
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [owner, repo, issueNumber]);
  
  const handleBountySuccess = () => {
    setShowForm(false);
    // Reload the page to see updated bounty
    window.location.reload();
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !repository || !issue) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Failed to load issue details'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            component={RouterLink} 
            to="/repositories"
          >
            Back to Repositories
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/">
          Home
        </Link>
        <Link component={RouterLink} to="/repositories">
          Repositories
        </Link>
        <Link 
          component={RouterLink} 
          to={`/repositories/${owner}/${repo}`}
        >
          {repository.fullName}
        </Link>
        <Typography color="text.primary">
          Issue #{issue.number}
        </Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Main content */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(66.666% - 16px)' } }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              {issue.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Issue #{issue.number} in {repository.owner}/{repository.name}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="a"
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mr: 2 }}
              >
                View on GitHub
              </Button>
              
              <Button
                variant="outlined"
                component={RouterLink}
                to={`/repositories/${owner}/${repo}`}
              >
                Back to Repository
              </Button>
            </Box>
          </Paper>
          
          {showForm ? (
            <BountyForm
              repository={repository}
              issue={issue}
              onSuccess={handleBountySuccess}
              onCancel={handleCancelForm}
            />
          ) : bounty ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Current Bounty</Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowForm(true)}
                  disabled={!isAuthenticated}
                >
                  Add Funds
                </Button>
              </Box>
              <BountyCard bounty={bounty} showActions={false} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No Bounty Yet
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Be the first to fund this issue with a bounty.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowForm(true)}
                disabled={!isAuthenticated}
              >
                Fund Bounty
              </Button>
              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please login with GitHub to create a bounty.
                </Alert>
              )}
            </Box>
          )}
        </Box>
        
        {/* Sidebar */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          {isAuthenticated && <WalletInfo />}
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              About Bounties
            </Typography>
            <Typography variant="body2" paragraph>
              Bounties are funded in BSV (Bitcoin SV) and stored on the blockchain using smart contracts.
            </Typography>
            <Typography variant="body2" paragraph>
              When the issue is resolved and the solution is accepted, the bounty is paid to the developer who solved it.
            </Typography>
            <Typography variant="body2">
              You can add additional funds to increase the bounty amount at any time.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default IssueBounty;