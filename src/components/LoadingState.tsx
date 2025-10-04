import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Container
} from '@mui/material';

interface LoadingStateProps {
  message?: string;
  type?: 'page' | 'component' | 'overlay';
  showSkeleton?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  type = 'component',
  showSkeleton = false 
}) => {
  if (type === 'page') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we prepare your financial data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (type === 'overlay') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={40} />
              <Typography variant="h6">
                {message}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (showSkeleton) {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={30} />
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center"
      py={4}
    >
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;