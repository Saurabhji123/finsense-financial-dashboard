import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  AccountBalance
} from '@mui/icons-material';
import { useAuth } from '../services/authContext';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const theme = useTheme();
  const { login, register, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isResetPassword) return true;

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Please enter your full name');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isResetPassword) {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox.');
        setIsResetPassword(false);
      } else if (isLogin) {
        await login(formData.email, formData.password);
        setSuccess('Login successful!');
        onSuccess?.();
      } else {
        await register(formData.email, formData.password, formData.name);
        setSuccess('Account created successfully! Please verify your email.');
        onSuccess?.();
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setError('');
    setSuccess('');
  };

  const switchMode = (mode: 'login' | 'register' | 'reset') => {
    resetForm();
    setIsLogin(mode === 'login');
    setIsResetPassword(mode === 'reset');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                mb: 2
              }}
            >
              <AccountBalance sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              FinSense
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isResetPassword
                ? 'Reset Password'
                : isLogin
                ? 'Welcome Back'
                : 'Create Account'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {isResetPassword
                ? 'Enter your email to receive reset instructions'
                : isLogin
                ? 'Sign in to your account'
                : 'Join thousands managing their finances'
              }
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Name Field (Register only) */}
            {!isLogin && !isResetPassword && (
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Email Field */}
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Fields */}
            {!isResetPassword && (
              <>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm Password (Register only) */}
                {!isLogin && (
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isResetPassword ? (
                'Send Reset Email'
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Links */}
            <Box textAlign="center">
              {isResetPassword ? (
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => switchMode('login')}
                  sx={{ textDecoration: 'none' }}
                >
                  Back to Sign In
                </Link>
              ) : (
                <>
                  {isLogin && (
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => switchMode('reset')}
                      sx={{ textDecoration: 'none', display: 'block', mb: 1 }}
                    >
                      Forgot Password?
                    </Link>
                  )}
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                  
                  <Typography variant="body2" color="text.secondary">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => switchMode(isLogin ? 'register' : 'login')}
                      sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {isLogin ? 'Create one' : 'Sign in'}
                    </Link>
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthForm;