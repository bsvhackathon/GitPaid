import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  ListItemButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import BugReportIcon from '@mui/icons-material/BugReport';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Repository } from '../types/types';
import { repoAPI } from '../services/api';

interface ReposListProps {
  onSelectRepository: (repo: Repository) => void;
}

const ReposList: React.FC<ReposListProps> = ({ onSelectRepository }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedRepos = await repoAPI.getRepositories();
        setRepositories(fetchedRepos);
        setFilteredRepositories(fetchedRepos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError('Failed to load repositories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepositories();
  }, []);
  
  // Filter repositories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRepositories(repositories);
      return;
    }
    
    const filtered = repositories.filter(repo => 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredRepositories(filtered);
  }, [searchTerm, repositories]);
  
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
          placeholder="Search repositories..."
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
      
      {filteredRepositories.length === 0 ? (
        <Alert severity="info">
          No repositories found. Try adjusting your search criteria.
        </Alert>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredRepositories.map((repo, index) => (
            <React.Fragment key={repo.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem disablePadding>
                <ListItemButton
                  alignItems="flex-start" 
                  onClick={() => onSelectRepository(repo)}
                >
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{repo.fullName}</Typography>
                        {repo.private ? (
                          <LockIcon fontSize="small" sx={{ ml: 1 }} />
                        ) : (
                          <LockOpenIcon fontSize="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {repo.description && (
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 1
                            }}
                          >
                            {repo.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {repo.language && (
                            <Chip
                              label={repo.language}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          
                          <Chip
                            icon={<StarIcon />}
                            label={repo.stars}
                            size="small"
                            variant="outlined"
                          />
                          
                          <Chip
                            icon={<BugReportIcon />}
                            label={`${repo.issues} issues`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ReposList;