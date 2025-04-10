import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  CircularProgress,
  Link,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Issue, Repository } from '../types/types';
import { repoAPI } from '../services/api';
import { formatSatoshis } from '../services/wallet';
import { format } from 'date-fns';

interface IssuesListProps {
  repository: Repository;
  onSelectIssue: (issue: Issue) => void;
}

const IssuesList: React.FC<IssuesListProps> = ({ repository, onSelectIssue }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch issues for the repository
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedIssues = await repoAPI.getIssues(repository.owner, repository.name);
        setIssues(fetchedIssues);
        setFilteredIssues(fetchedIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIssues();
  }, [repository]);
  
  // Filter issues based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredIssues(issues);
      return;
    }
    
    const filtered = issues.filter(issue => 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.number.toString().includes(searchTerm)
    );
    
    setFilteredIssues(filtered);
  }, [searchTerm, issues]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search issues..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {filteredIssues.length === 0 ? (
        <Alert severity="info">
          No issues found. Try adjusting your search or select a different repository.
        </Alert>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredIssues.map((issue, index) => (
            <React.Fragment key={issue.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Link
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="textPrimary"
                    >
                      #{issue.number} {issue.title}
                    </Link>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {issue.labels.map(label => (
                          <Chip key={label} label={label} size="small" />
                        ))}
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Opened on {format(new Date(issue.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                      {issue.bounty > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <MonetizationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            Current bounty: {formatSatoshis(issue.bounty)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onSelectIssue(issue)}
                    startIcon={<MonetizationOnIcon />}
                  >
                    {issue.bounty > 0 ? 'Add Funds' : 'Fund Bounty'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default IssuesList;