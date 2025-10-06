import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Person,
  Edit,
  Security,
  Notifications,
  AccountBalance,
  Assessment,
  Camera,
  Check,
  Close,
  Visibility,
  VisibilityOff,
  Phone,
  Email,
  LocationOn,
  Work,
  School,
  TrendingUp,
  Shield,
  Verified
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Profile state with localStorage persistence
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user-profile');
    return saved ? JSON.parse(saved) : {
      name: 'Saurabh Kumar',
      email: 'saurabh@finsense.com',
      phone: '+91 9876543210',
      location: 'Mumbai, Maharashtra',
      occupation: 'Software Engineer',
      company: 'TechCorp Solutions',
      education: 'B.Tech Computer Science',
      joinDate: '2024-01-15',
      bio: 'Passionate about financial technology and smart investing. Building the future of personal finance management.',
      avatar: '',
      verified: true,
      kycStatus: 'completed',
      riskProfile: 'moderate'
    };
  });

  const [tempProfile, setTempProfile] = useState(profileData);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklyReports: true,
      investmentAlerts: true,
      budgetAlerts: true,
      securityAlerts: true
    };
  });

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(notifications));
  }, [notifications]);

  const handleSaveProfile = () => {
    setProfileData(tempProfile);
    setEditMode(false);
    setProfileSaved(true);
    
    // Save to localStorage for cross-component synchronization
    localStorage.setItem('user-profile', JSON.stringify(tempProfile));
    
    // Dispatch custom event for real-time updates across components
    window.dispatchEvent(new CustomEvent('profileUpdated', { 
      detail: tempProfile 
    }));
    
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleCancelEdit = () => {
    setTempProfile(profileData);
    setEditMode(false);
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwords.new.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    // Simulate password change
    alert('Password changed successfully!');
    setPasswordDialog(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAvatarUpload = () => {
    // Simulate file upload
    const confirmed = window.confirm('Upload new profile photo?');
    if (confirmed) {
      alert('Photo upload feature would be implemented here');
    }
  };

  const accountStats = {
    totalInvestments: 680000, // ₹6.8L investments
    monthlyIncome: 158000,    // ₹1.58L monthly income (matches Dashboard)
    monthlySpending: 29000,   // ₹29k monthly expenses (realistic ratio)
    savingsRate: 82,          // 82% savings rate (matches Dashboard logic)
    portfolioGrowth: 12.5,
    connectedAccounts: 3,
    transactionsThisMonth: 108,
    emergencyFund: 156600,    // 5.4 months of expenses
    annualSavings: 1548000    // ₹15.48L annual savings
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Profile & Settings
        </Typography>
        <Chip 
          icon={<Verified />} 
          label="KYC Verified" 
          color="success" 
          variant="outlined" 
        />
      </Box>

      {profileSaved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                sx={{ width: 100, height: 100 }}
                src={profileData.avatar}
              >
                {profileData.name.split(' ').map((n: string) => n[0]).join('')}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
                onClick={handleAvatarUpload}
              >
                <Camera fontSize="small" />
              </IconButton>
            </Box>
            
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h5" fontWeight="bold">
                  {profileData.name}
                </Typography>
                {profileData.verified && (
                  <Chip icon={<Shield />} label="Verified" color="success" size="small" />
                )}
              </Box>
              
              <Typography variant="body1" color="text.secondary" mb={2}>
                {profileData.bio}
              </Typography>
              
              <Box display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Work fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profileData.occupation} at {profileData.company}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profileData.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Button
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <Close /> : <Edit />}
              onClick={editMode ? handleCancelEdit : () => setEditMode(true)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Investments
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ₹{accountStats.totalInvestments.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Monthly Income
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ₹{accountStats.monthlyIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Monthly Spending
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              ₹{accountStats.monthlySpending.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Food: ₹8,500 • Transport: ₹5,200
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Shopping: ₹4,800 • Bills: ₹3,200 • Others: ₹7,300
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Savings Rate
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {accountStats.savingsRate}%
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ₹{(accountStats.monthlyIncome - accountStats.monthlySpending).toLocaleString()}/month saved
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Emergency Fund
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              ₹{accountStats.emergencyFund.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
              5.4 months covered
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Portfolio Growth
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              +{accountStats.portfolioGrowth}%
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Annual Savings Projection
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ₹{(accountStats.annualSavings / 100000).toFixed(1)}L
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              On track for FI goals!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<AccountBalance />} label="Connected Accounts" />
        </Tabs>
      </Paper>

      {/* Personal Info Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editMode ? tempProfile.name : profileData.name}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, name: e.target.value }))}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Email"
                value={editMode ? tempProfile.email : profileData.email}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, email: e.target.value }))}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={editMode ? tempProfile.phone : profileData.phone}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, phone: e.target.value }))}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Location"
                value={editMode ? tempProfile.location : profileData.location}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, location: e.target.value }))}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Occupation"
                value={editMode ? tempProfile.occupation : profileData.occupation}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, occupation: e.target.value }))}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Company"
                value={editMode ? tempProfile.company : profileData.company}
                onChange={(e) => setTempProfile((prev: any) => ({ ...prev, company: e.target.value }))}
                disabled={!editMode}
              />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={editMode ? tempProfile.bio : profileData.bio}
                  onChange={(e) => setTempProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                  disabled={!editMode}
                />
              </Box>
            </Box>

            {editMode && (
              <Box display="flex" gap={2} mt={3}>
                <Button variant="contained" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Change Password"
                  secondary="Update your account password"
                />
                <Button 
                  variant="outlined" 
                  onClick={() => setPasswordDialog(true)}
                >
                  Change
                </Button>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <Shield color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security"
                />
                <Switch defaultChecked />
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <Verified color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="KYC Verification"
                  secondary="Your identity is verified"
                />
                <Chip label="Completed" color="success" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive updates via email"
                />
                <Switch
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications((prev: any) => ({ ...prev, emailAlerts: e.target.checked }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="SMS Alerts"
                  secondary="Get important alerts via SMS"
                />
                <Switch
                  checked={notifications.smsAlerts}
                  onChange={(e) => setNotifications((prev: any) => ({ ...prev, smsAlerts: e.target.checked }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Weekly Reports"
                  secondary="Weekly financial summary"
                />
                <Switch
                  checked={notifications.weeklyReports}
                  onChange={(e) => setNotifications((prev: any) => ({ ...prev, weeklyReports: e.target.checked }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Investment Alerts"
                  secondary="Portfolio performance updates"
                />
                <Switch
                  checked={notifications.investmentAlerts}
                  onChange={(e) => setNotifications((prev: any) => ({ ...prev, investmentAlerts: e.target.checked }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Budget Alerts"
                  secondary="Spending limit notifications"
                />
                <Switch
                  checked={notifications.budgetAlerts}
                  onChange={(e) => setNotifications((prev: any) => ({ ...prev, budgetAlerts: e.target.checked }))}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Connected Accounts Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Connected Bank Accounts
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="State Bank of India"
                  secondary="****1234 • Last sync: 2 minutes ago"
                />
                <Chip label="Active" color="success" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="HDFC Bank"
                  secondary="****5678 • Last sync: 1 hour ago"
                />
                <Chip label="Active" color="success" />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Zerodha"
                  secondary="Trading account • Last sync: 30 minutes ago"
                />
                <Chip label="Active" color="success" />
              </ListItem>
            </List>
            
            <Button variant="outlined" startIcon={<AccountBalance />} sx={{ mt: 2 }}>
              Connect New Account
            </Button>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
            />
            
            {/* Password Strength Indicator */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Password Strength
              </Typography>
              <LinearProgress
                variant="determinate"
                value={passwords.new.length * 10}
                color={passwords.new.length < 6 ? 'error' : passwords.new.length < 8 ? 'warning' : 'success'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.new || !passwords.confirm}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;