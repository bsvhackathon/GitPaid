import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  FormHelperText
} from '@mui/material';
import { Issue, Repository, CreateBountyParams } from '../types/types';
import { bountyAPI } from '../services/api';
import { formatSatoshis, satoshisToUSD } from '../services/wallet';
import { useAuth } from '../context/AuthContext';

interface BountyFormProps {
  repository: Repository;
  issue: Issue;
  onSuccess: () => void;
  onCancel: () => void;
}

const BountyForm: React.FC<BountyFormProps> = ({
  repository,
  issue,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  
  // Validate amount input
  const validateAmount = (value: string): boolean => {
    if (!value || isNaN(Number(value))) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    
    const numValue = Number(value);
    if (numValue <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    
    if (numValue > (user?.walletBalance || 0)) {
      setAmountError('Insufficient wallet balance');
      return false;
    }
    
    setAmountError(null);
    return true;
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAmount(amount)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bountyData: CreateBountyParams = {
        repositoryOwner: repository.owner,
        repositoryName: repository.name,
        issueNumber: issue.number,
        issueTitle: issue.title,
        amount: Number(amount)
      };
      
      await bountyAPI.createBounty(bountyData);
      onSuccess();
    } catch (error) {
      console.error('Error creating bounty:', error);
      setError('Failed to create bounty. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const numericAmount = Number(amount) || 0;
  const usdEquivalent = satoshisToUSD(numericAmount);
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Fund Bounty
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Repository:</strong> {repository.owner}/{repository.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Issue:</strong> #{issue.number} - {issue.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Your Balance:</strong> {formatSatoshis(user?.walletBalance || 0)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Bounty Amount (in satoshis)"
            variant="outlined"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            error={!!amountError}
            helperText={amountError}
            disabled={loading}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">satoshis</InputAdornment>,
            }}
            sx={{ mb: 1 }}
          />
          
          {numericAmount > 0 && (
            <FormHelperText sx={{ mb: 2 }}>
              Approximately {usdEquivalent} at current exchange rate
            </FormHelperText>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="secondary"
              disabled={loading || !!amountError || !amount}
            >
              {loading ? <CircularProgress size={24} /> : 'Fund Bounty'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default BountyForm;