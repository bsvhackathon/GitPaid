import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Link,
  Tooltip,
  Divider
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GitHubIcon from '@mui/icons-material/GitHub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { Bounty } from '../types/types';
import { formatSatoshis, satoshisToUSD } from '../services/wallet';
import { format } from 'date-fns';

interface BountyCardProps {
  bounty: Bounty;
  showActions?: boolean;
  onClaim?: (bounty: Bounty) => void;
  onViewDetails?: (bounty: Bounty) => void;
}

const statusColors = {
  'open': 'success',
  'in-progress': 'warning',
  'completed': 'info',
  'cancelled': 'error'
};

const BountyCard: React.FC<BountyCardProps> = ({ 
  bounty, 
  showActions = true,
  onClaim,
  onViewDetails
}) => {
  const issueUrl = `https://github.com/${bounty.repositoryOwner}/${bounty.repositoryName}/issues/${bounty.issueNumber}`;
  const formattedCreatedDate = format(new Date(bounty.createdAt), 'MMM dd, yyyy');
  
  return (
    <Card sx={{ mb: 2, borderLeft: 3, borderColor: `${statusColors[bounty.status]}.main` }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {bounty.issueTitle}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Link 
            href={issueUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            underline="hover"
            color="textSecondary"
          >
            {bounty.repositoryOwner}/{bounty.repositoryName}#{bounty.issueNumber}
          </Link>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={bounty.status.toUpperCase()} 
            color={statusColors[bounty.status] as any} 
            size="small" 
            variant="outlined"
          />
          
          <Tooltip title={satoshisToUSD(bounty.amount)}>
            <Chip
              icon={<MonetizationOnIcon />}
              label={formatSatoshis(bounty.amount)}
              color="primary"
              size="small"
            />
          </Tooltip>
          
          <Chip
            icon={<AccessTimeIcon />}
            label={formattedCreatedDate}
            size="small"
            variant="outlined"
          />
          
          <Chip
            icon={<PersonIcon />}
            label={`Funded by ${bounty.funder.username}`}
            size="small"
            variant="outlined"
          />
        </Box>
        
        {bounty.solver && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Being solved by: {bounty.solver.username}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      {showActions && (
        <>
          <Divider />
          <CardActions>
            {onViewDetails && (
              <Button 
                size="small" 
                onClick={() => onViewDetails(bounty)}
              >
                View Details
              </Button>
            )}
            
            {bounty.status === 'open' && onClaim && (
              <Button 
                size="small" 
                color="secondary"
                variant="contained"
                onClick={() => onClaim(bounty)}
              >
                Claim Bounty
              </Button>
            )}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default BountyCard;