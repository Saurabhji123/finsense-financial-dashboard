import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  AccountBalance,
  TrendingUp,
  Security,
  AutoMode,
  Notifications
} from '@mui/icons-material';
import { RealBankAccount } from '../services/realBankIntegration';

interface BankConnectionSuccessProps {
  linkedAccounts: RealBankAccount[];
  onContinueToDashboard: () => void;
}

const BankConnectionSuccess: React.FC<BankConnectionSuccessProps> = ({
  linkedAccounts,
  onContinueToDashboard
}) => {
  const totalBalance = linkedAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      
      <Typography variant="h4" gutterBottom>
        🎉 Bank Accounts Connected!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your real bank accounts are now linked to FinSense. Real transaction data will be automatically synced.
      </Typography>

      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Connected Accounts Summary
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" sx={{ color: 'white' }}>
              ₹{totalBalance.toLocaleString()}
            </Typography>
            <Chip 
              label={`${linkedAccounts.length} Account${linkedAccounts.length > 1 ? 's' : ''}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'left', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connected Bank Accounts:
        </Typography>
        {linkedAccounts.map((account) => (
          <Card key={account.id} sx={{ mb: 1 }}>
            <CardContent sx={{ py: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <AccountBalance color="primary" />
                  <Box>
                    <Typography variant="subtitle1">{account.bankName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.accountNumber} • {account.accountType.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="primary">
                    ₹{account.balance.toLocaleString()}
                  </Typography>
                  <Chip label="Linked" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          What's happening now:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <AutoMode color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Real-time Transaction Sync"
              secondary="Your transactions are being automatically synchronized"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TrendingUp color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Smart Categorization"
              secondary="AI is analyzing your spending patterns and creating insights"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Security color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Secure Data Processing"
              secondary="All your financial data is encrypted and processed securely"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Notifications color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Smart Notifications"
              secondary="You'll receive intelligent alerts about your finances"
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Setting up your personalized dashboard...
        </Typography>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>

      <Button 
        variant="contained" 
        size="large" 
        onClick={onContinueToDashboard}
        sx={{ 
          py: 1.5, 
          px: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        Continue to Dashboard
      </Button>
    </Box>
  );
};

export default BankConnectionSuccess;