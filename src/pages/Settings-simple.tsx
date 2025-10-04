import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  AccountCircle,
  Notifications,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../services/authContext';

const Settings: React.FC = () => {
  const { userProfile, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    budgetAlerts: true,
    weeklyReports: false,
  });

  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || ''
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        name: profileData.name,
        phoneNumber: profileData.phoneNumber
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to logout. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your account preferences and app settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Profile Settings */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Profile Information</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Email Address"
                value={profileData.email}
                disabled
                fullWidth
                helperText="Email cannot be changed"
              />
              <TextField
                label="Phone Number"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleProfileUpdate}
                disabled={loading}
                sx={{ alignSelf: 'flex-start', mt: 2 }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>

          {/* Notification Settings */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Notifications sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  />
                }
                label="Email Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.budgetAlerts}
                    onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                  />
                }
                label="Budget Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.weeklyReports}
                    onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                  />
                }
                label="Weekly Reports"
              />
            </Box>
          </Paper>

          {/* Account Security */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Security sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Account Security</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" color="primary">
                Change Password
              </Button>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Sign Out
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;