import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  Divider
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Repository, Issue } from '../types/types';
import ReposList from '../components/ReposList';
import IssuesList from '../components/IssuesList';

const RepositoryView: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const navigate = useNavigate();
  
  // Handle repository selection
  const handleSelectRepository = (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
  };
  
  // Handle issue selection
  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    // Navigate to issue bounty page
    navigate(`/repositories/${selectedRepo?.owner}/${selectedRepo?.name}/issues/${issue.number}`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/">
          Home
        </Link>
        <Typography color="text.primary">Repositories</Typography>
        {selectedRepo && (
          <Typography color="text.primary">{selectedRepo.fullName}</Typography>
        )}
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Main content */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(66.666% - 16px)' } }}>
          {selectedRepo ? (
            <Box>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FolderIcon sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    {selectedRepo.owner}/{selectedRepo.name}
                  </Typography>
                </Box>
                
                {selectedRepo.description && (
                  <Typography variant="body1" paragraph>
                    {selectedRepo.description}
                  </Typography>
                )}
                
                <Button 
                  variant="outlined"
                  onClick={() => setSelectedRepo(null)}
                >
                  Back to Repositories
                </Button>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Open Issues
              </Typography>
              <IssuesList 
                repository={selectedRepo}
                onSelectIssue={handleSelectIssue}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                Select a Repository
              </Typography>
              <Typography variant="body1" paragraph>
                Choose a repository to view its issues and create bounties.
              </Typography>
              <ReposList onSelectRepository={handleSelectRepository} />
            </Box>
          )}
        </Box>
        
        {/* Sidebar */}
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How to Fund a Bounty
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  1. Select a Repository
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Browse your GitHub repositories or search for a specific one.
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  2. Choose an Issue
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Select an open issue you want to fund with a bounty.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  3. Set Bounty Amount
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Specify the amount of BSV you want to offer as a reward.
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Best Practices
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                • Set clear expectations in the issue description
              </Typography>
              <Typography variant="body2" paragraph>
                • Fund issues with detailed requirements
              </Typography>
              <Typography variant="body2" paragraph>
                • Choose appropriate bounty amounts based on complexity
              </Typography>
              <Typography variant="body2">
                • Be responsive to questions from developers
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default RepositoryView;