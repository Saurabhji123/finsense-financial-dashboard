import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment
} from '@mui/material';
import {
  AccountBalance,
  Phone,
  Security,
  Check
} from '@mui/icons-material';
import { RealBankAccount, AccountVerification, realBankIntegrationService } from '../services/realBankIntegration';
import { useAuth } from '../services/authContext';

interface BankAccountSelectorProps {
  open: boolean;
  onClose: () => void;
  onAccountsLinked: (accounts: RealBankAccount[]) => void;
}

const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({
  open,
  onClose,
  onAccountsLinked
}) => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [discoveredAccounts, setDiscoveredAccounts] = useState<RealBankAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<RealBankAccount[]>([]);
  const [verificationData, setVerificationData] = useState<{ [accountId: string]: AccountVerification }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTP, setShowOTP] = useState<{ [accountId: string]: boolean }>({});

  const steps = ['Enter Phone Number', 'Select Accounts', 'Verify Accounts', 'Success'];

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setActiveStep(0);
      setPhoneNumber('');
      setDiscoveredAccounts([]);
      setSelectedAccounts([]);
      setVerificationData({});
      setError('');
      setSuccess('');
    }
  }, [open]);

  // Step 1: Discover accounts by phone number
  const handleDiscoverAccounts = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accounts = await realBankIntegrationService.discoverAccountsByPhone(phoneNumber);
      
      if (accounts.length === 0) {
        setError('No bank accounts found linked to this phone number. Please check and try again.');
      } else {
        setDiscoveredAccounts(accounts);
        setSuccess(`Found ${accounts.length} bank account(s) linked to your phone number!`);
        setActiveStep(1);
      }
    } catch (error) {
      setError('Error discovering accounts. Please try again.');
      console.error('Account discovery error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select accounts to link
  const handleAccountSelection = (account: RealBankAccount, selected: boolean) => {
    if (selected) {
      setSelectedAccounts(prev => [...prev, account]);
    } else {
      setSelectedAccounts(prev => prev.filter(acc => acc.id !== account.id));
    }
  };

  const handleProceedToVerification = () => {
    if (selectedAccounts.length === 0) {
      setError('Please select at least one account to link');
      return;
    }

    // Initialize verification data for selected accounts
    const initVerificationData: { [accountId: string]: AccountVerification } = {};
    selectedAccounts.forEach(account => {
      initVerificationData[account.id] = {
        phoneNumber,
        accountNumber: '',
        ifscCode: account.ifscCode,
        customerName: '',
        isVerified: false
      };
    });
    setVerificationData(initVerificationData);
    setActiveStep(2);
    setError('');
  };

  // Step 3: Verify accounts
  const handleVerificationDataChange = (accountId: string, field: keyof AccountVerification, value: string) => {
    console.log(`🔄 Updating verification data: ${field} = ${value} for account ${accountId}`);
    setVerificationData(prev => {
      const newData = {
        ...prev,
        [accountId]: {
          ...prev[accountId],
          [field]: value
        }
      };
      console.log('📋 Updated verification data:', newData[accountId]);
      return newData;
    });
  };

  const sendOTP = async (account: RealBankAccount) => {
    setLoading(true);
    try {
      // Here you would integrate with actual bank OTP service
      console.log(`Sending OTP for ${account.bankName} account verification`);
      
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowOTP(prev => ({ ...prev, [account.id]: true }));
      setSuccess(`OTP sent to your registered mobile number for ${account.bankName} verification`);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAccount = async (account: RealBankAccount) => {
    if (!currentUser) return;

    console.log('🎯 DEMO: Starting verification for:', account.bankName);
    
    // Simple demo verification - use any data provided or defaults
    const verification = verificationData[account.id] || {};
    const finalVerification = {
      phoneNumber: phoneNumber,
      accountNumber: verification.accountNumber || account.accountNumber.replace(/\*/g, '1'),
      ifscCode: verification.ifscCode || account.ifscCode,
      customerName: verification.customerName || 'Demo User',
      otp: verification.otp || '123456',
      isVerified: false
    };

    setLoading(true);
    setError('');

    try {
      const result = await realBankIntegrationService.verifyAndLinkAccount(
        currentUser.uid,
        account,
        finalVerification
      );

      if (result.success) {
        setVerificationData(prev => ({
          ...prev,
          [account.id]: {
            ...prev[account.id],
            isVerified: true
          }
        }));
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Account verification failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = () => {
    const linkedAccounts = selectedAccounts.filter(account => 
      verificationData[account.id]?.isVerified
    );

    if (linkedAccounts.length === 0) {
      setError('Please verify at least one account to continue');
      return;
    }

    // Move to success step
    setActiveStep(3);
    
    // Call the parent handler
    onAccountsLinked(linkedAccounts);
    
    // Close dialog after showing success for a moment
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your phone number to discover all bank accounts linked to it
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
              helperText="We'll discover all bank accounts linked to this number"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Select the bank accounts you want to connect to FinSense
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {discoveredAccounts.map((account) => (
                <Card 
                  key={account.id} 
                  sx={{ 
                    border: selectedAccounts.find(acc => acc.id === account.id) 
                      ? '2px solid #4caf50' 
                      : '1px solid #e0e0e0',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleAccountSelection(
                    account, 
                    !selectedAccounts.find(acc => acc.id === account.id)
                  )}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <AccountBalance color="primary" />
                        <Box>
                          <Typography variant="h6">{account.bankName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {account.accountNumber} • {account.accountType.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {account.branchName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h6" color="primary">
                          ₹{account.balance.toLocaleString()}
                        </Typography>
                        <Chip 
                          label={selectedAccounts.find(acc => acc.id === account.id) ? 'Selected' : 'Select'}
                          color={selectedAccounts.find(acc => acc.id === account.id) ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Verify your account ownership for secure linking
            </Typography>
            <Box display="flex" flexDirection="column" gap={3}>
              {selectedAccounts.map((account) => (
                <Card key={account.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                      <AccountBalance color="primary" />
                      <Typography variant="h6">{account.bankName}</Typography>
                      {verificationData[account.id]?.isVerified && (
                        <Chip icon={<Check />} label="Verified" color="success" size="small" />
                      )}
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        fullWidth
                        label="Account Holder Name"
                        value={verificationData[account.id]?.customerName || ''}
                        onChange={(e) => handleVerificationDataChange(account.id, 'customerName', e.target.value)}
                        placeholder="Enter name as per bank records"
                        disabled={verificationData[account.id]?.isVerified}
                      />

                      <TextField
                        fullWidth
                        label="Account Number"
                        value={verificationData[account.id]?.accountNumber || ''}
                        onChange={(e) => handleVerificationDataChange(account.id, 'accountNumber', e.target.value)}
                        placeholder="Enter full account number"
                        disabled={verificationData[account.id]?.isVerified}
                      />

                      {showOTP[account.id] && (
                        <>
                          <Alert severity="info" sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              <strong>🎯 Demo Mode:</strong> Use OTP <strong>123456</strong> for verification
                            </Typography>
                          </Alert>
                          <TextField
                            fullWidth
                            label="OTP (Use: 123456)"
                            value={verificationData[account.id]?.otp || ''}
                            onChange={(e) => handleVerificationDataChange(account.id, 'otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 123456 for demo"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Security />
                                </InputAdornment>
                              ),
                            }}
                            disabled={verificationData[account.id]?.isVerified}
                            helperText="Demo: Use 123456 for quick verification"
                          />
                        </>
                      )}
                    </Box>

                    {!verificationData[account.id]?.isVerified && (
                      <CardActions>
                        {!showOTP[account.id] ? (
                          <Button 
                            variant="outlined" 
                            onClick={() => sendOTP(account)}
                            disabled={loading}
                          >
                            Send OTP
                          </Button>
                        ) : (
                          <Button 
                            variant="contained" 
                            onClick={() => verifyAccount(account)}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={20} /> : 'Verify Account'}
                          </Button>
                        )}
                      </CardActions>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box textAlign="center" py={4}>
            <Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Bank Accounts Linked Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your real bank accounts are now connected to FinSense. 
              Real transaction data will start syncing automatically.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h5">Connect Your Bank Accounts</Typography>
          <Typography variant="body2" color="text.secondary">
            Link your real bank accounts for automatic transaction tracking
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep === 0 && (
          <Button 
            variant="contained" 
            onClick={handleDiscoverAccounts}
            disabled={loading || !phoneNumber || phoneNumber.length !== 10}
          >
            {loading ? <CircularProgress size={20} /> : 'Discover Accounts'}
          </Button>
        )}

        {activeStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handleProceedToVerification}
            disabled={selectedAccounts.length === 0}
          >
            Proceed to Verification
          </Button>
        )}

        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={handleCompleteSetup}
            disabled={loading || selectedAccounts.every(acc => !verificationData[acc.id]?.isVerified)}
          >
            Complete Setup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BankAccountSelector;