import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Notifications,
  Delete,
  Add,
  TrendingUp,
  TrendingDown,
  Settings,
  Security,
  Sync,
  Schedule
} from '@mui/icons-material';
// import { useAuth } from '../services/authContext';

interface InvestmentAlert {
  id: string;
  type: 'price_target' | 'percentage_change' | 'volume_spike';
  symbol: string;
  condition: 'above' | 'below';
  value: number;
  isActive: boolean;
  createdAt: Date;
}

interface InvestmentSettings {
  priceTracking: boolean;
  realTimeUpdates: boolean;
  notifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  updateInterval: number; // in minutes
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  autoRebalancing: boolean;
  taxOptimization: boolean;
}

const InvestmentSettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [settings, setSettings] = useState<InvestmentSettings>({
    priceTracking: true,
    realTimeUpdates: true,
    notifications: true,
    emailAlerts: false,
    smsAlerts: false,
    updateInterval: 5,
    riskTolerance: 'moderate',
    autoRebalancing: false,
    taxOptimization: true
  });

  const [alerts, setAlerts] = useState<InvestmentAlert[]>([
    {
      id: '1',
      type: 'price_target',
      symbol: 'RELIANCE',
      condition: 'above',
      value: 2500,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'percentage_change',
      symbol: 'TCS',
      condition: 'below',
      value: -5,
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [newAlertDialog, setNewAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price_target' as InvestmentAlert['type'],
    symbol: '',
    condition: 'above' as InvestmentAlert['condition'],
    value: 0
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('investmentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof InvestmentSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Save to localStorage (in real app, save to Firebase)
      localStorage.setItem('investmentSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const addAlert = () => {
    const alert: InvestmentAlert = {
      id: Date.now().toString(),
      ...newAlert,
      isActive: true,
      createdAt: new Date()
    };
    
    setAlerts(prev => [...prev, alert]);
    setNewAlert({
      type: 'price_target',
      symbol: '',
      condition: 'above',
      value: 0
    });
    setNewAlertDialog(false);
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const getAlertTypeLabel = (type: InvestmentAlert['type']) => {
    switch (type) {
      case 'price_target': return 'Price Target';
      case 'percentage_change': return 'Percentage Change';
      case 'volume_spike': return 'Volume Spike';
      default: return type;
    }
  };

  const getRiskToleranceColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'success';
      case 'moderate': return 'warning';
      case 'aggressive': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Investment Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your investment tracking preferences and alerts
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* General Settings */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">General Settings</Typography>
              </Box>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.priceTracking}
                      onChange={(e) => handleSettingChange('priceTracking', e.target.checked)}
                    />
                  }
                  label="Enable Price Tracking"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.realTimeUpdates}
                      onChange={(e) => handleSettingChange('realTimeUpdates', e.target.checked)}
                    />
                  }
                  label="Real-time Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoRebalancing}
                      onChange={(e) => handleSettingChange('autoRebalancing', e.target.checked)}
                    />
                  }
                  label="Auto Portfolio Rebalancing"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.taxOptimization}
                      onChange={(e) => handleSettingChange('taxOptimization', e.target.checked)}
                    />
                  }
                  label="Tax-loss Harvesting"
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Update Interval (minutes)
                </Typography>
                <TextField
                  type="number"
                  value={settings.updateInterval}
                  onChange={(e) => handleSettingChange('updateInterval', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 60 }}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Risk Tolerance
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                    <Chip
                      key={risk}
                      label={risk.charAt(0).toUpperCase() + risk.slice(1)}
                      color={settings.riskTolerance === risk ? getRiskToleranceColor(risk) as any : 'default'}
                      variant={settings.riskTolerance === risk ? 'filled' : 'outlined'}
                      onClick={() => handleSettingChange('riskTolerance', risk)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Notification Settings */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Notifications</Typography>
              </Box>

              <FormGroup>
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
                      checked={settings.smsAlerts}
                      onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
                    />
                  }
                  label="SMS Alerts"
                />
              </FormGroup>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Email and SMS alerts are available for premium users. 
                  Upgrade your plan to receive alerts on important market movements.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Price Alerts */}
      <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Price Alerts</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setNewAlertDialog(true)}
                  size="small"
                >
                  Add Alert
                </Button>
              </Box>

              {alerts.length === 0 ? (
                <Alert severity="info">
                  No price alerts configured. Add alerts to get notified about important price movements.
                </Alert>
              ) : (
                <List>
                  {alerts.map((alert) => (
                    <ListItem key={alert.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {alert.symbol}
                            </Typography>
                            <Chip
                              label={getAlertTypeLabel(alert.type)}
                              size="small"
                              variant="outlined"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {alert.condition === 'above' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                              <Typography variant="body2">
                                {alert.type === 'percentage_change' ? `${alert.value}%` : `₹${alert.value}`}
                              </Typography>
                            </Box>
                            {!alert.isActive && (
                              <Chip label="Inactive" size="small" color="default" />
                            )}
                          </Box>
                        }
                        secondary={`Created ${alert.createdAt.toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={alert.isActive}
                            onChange={() => toggleAlert(alert.id)}
                            size="small"
                          />
                          <IconButton
                            edge="end"
                            onClick={() => deleteAlert(alert.id)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
      </Box>

      {/* Data & Privacy */}
      <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Data & Privacy</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Sync />}
                  sx={{ minWidth: 120 }}
                  onClick={() => {
                    // Implement data sync
                    console.log('Syncing data...');
                  }}
                >
                  Sync Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  sx={{ minWidth: 120 }}
                  onClick={() => {
                    // Implement data export
                    console.log('Exporting data...');
                  }}
                >
                  Export Data
                </Button>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Your investment data is encrypted and stored securely. 
                  We never share your financial information with third parties.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
      </Box>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          sx={{ minWidth: 120 }}
        >
          {saveStatus === 'saving' ? 'Saving...' : 
           saveStatus === 'saved' ? 'Saved!' : 
           saveStatus === 'error' ? 'Error' : 'Save Settings'}
        </Button>
      </Box>

      {/* Add Alert Dialog */}
      <Dialog open={newAlertDialog} onClose={() => setNewAlertDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Price Alert</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label="Alert Type"
              value={newAlert.type}
              onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="price_target">Price Target</option>
              <option value="percentage_change">Percentage Change</option>
              <option value="volume_spike">Volume Spike</option>
            </TextField>

            <TextField
              label="Symbol"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              placeholder="e.g., RELIANCE, TCS"
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Condition"
                value={newAlert.condition}
                onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </TextField>

              <TextField
                label={newAlert.type === 'percentage_change' ? 'Percentage (%)' : 'Price (₹)'}
                type="number"
                value={newAlert.value}
                onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewAlertDialog(false)}>Cancel</Button>
          <Button 
            onClick={addAlert}
            variant="contained"
            disabled={!newAlert.symbol || !newAlert.value}
          >
            Add Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentSettingsPage;