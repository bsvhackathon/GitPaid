import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import { formatSatoshis } from '../services/wallet';

const AppHeader: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };
  
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MonetizationOnIcon sx={{ mr: 1 }} />
          GitPaid
        </Typography>
        
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user?.walletBalance !== undefined && (
              <Tooltip title="Wallet Balance">
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {formatSatoshis(user.walletBalance)}
                </Typography>
              </Tooltip>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
              {user?.avatarUrl ? (
                <Avatar 
                  src={user.avatarUrl} 
                  alt={user.displayName}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              ) : (
                <AccountCircleIcon sx={{ mr: 1 }} />
              )}
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user?.displayName || user?.username}
              </Typography>
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfile}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            startIcon={<GitHubIcon />}
            onClick={login}
          >
            Login with GitHub
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;