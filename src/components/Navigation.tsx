import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  AccountBalance,
  Dashboard,
  Settings,
  Logout,
  Person,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../services/authContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const theme = useTheme();
  const { userProfile, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { id: 'investments', label: 'Investments', icon: <TrendingUp /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> }
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box display="flex" alignItems="center" sx={{ mr: 4 }}>
          <AccountBalance sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h5" component="div" fontWeight="bold">
            FinSense
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              color="inherit"
              startIcon={item.icon}
              onClick={() => onNavigate(item.id)}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: currentPage === item.id ? alpha(theme.palette.common.white, 0.2) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* User Menu */}
        <Box>
          <IconButton
            size="large"
            edge="end"
            onClick={handleMenuOpen}
            color="inherit"
            sx={{
              border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
              <Person />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {userProfile?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userProfile?.email}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onNavigate('settings'); }}>
              <Settings sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;