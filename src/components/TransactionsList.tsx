import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Box,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Restaurant,
  DirectionsCar,
  ShoppingBag,
  MovieCreation,
  Receipt,
  SwapHoriz,
  Category,
  TrendingDown,
  TrendingUp,
  MoreVert
} from '@mui/icons-material';
import { Transaction, TransactionCategory } from '../types';
import { format, isToday, isYesterday } from 'date-fns';

interface TransactionsListProps {
  transactions: Transaction[];
  showAll?: boolean;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  transactions, 
  showAll = false 
}) => {
  const getCategoryIcon = (category: TransactionCategory) => {
    const iconProps = { sx: { color: 'white' } };
    
    switch (category) {
      case 'Food': return <Restaurant {...iconProps} />;
      case 'Transport': return <DirectionsCar {...iconProps} />;
      case 'Shopping': return <ShoppingBag {...iconProps} />;
      case 'Entertainment': return <MovieCreation {...iconProps} />;
      case 'Bills': return <Receipt {...iconProps} />;
      case 'Transfer': return <SwapHoriz {...iconProps} />;
      default: return <Category {...iconProps} />;
    }
  };

  const getCategoryColor = (category: TransactionCategory) => {
    switch (category) {
      case 'Food': return '#FF6B6B';
      case 'Transport': return '#4ECDC4';
      case 'Shopping': return '#45B7D1';
      case 'Entertainment': return '#96CEB4';
      case 'Bills': return '#FECA57';
      case 'Transfer': return '#FF9FF3';
      default: return '#74b9ff';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTransactionDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi': return 'success';
      case 'card': return 'primary';
      case 'net banking': return 'info';
      case 'cash': return 'warning';
      case 'wallet': return 'secondary';
      default: return 'default';
    }
  };

  const displayTransactions = showAll ? transactions : transactions.slice(0, 10);

  return (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          {!showAll && transactions.length > 10 && (
            <Typography variant="body2" color="text.secondary">
              Showing {displayTransactions.length} of {transactions.length}
            </Typography>
          )}
        </Box>
      </Box>
      
      <List sx={{ pt: 0, maxHeight: showAll ? 'none' : '400px', overflow: 'auto' }}>
        {displayTransactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    backgroundColor: getCategoryColor(transaction.category),
                    width: 48,
                    height: 48,
                  }}
                >
                  {getCategoryIcon(transaction.category)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {transaction.merchant || transaction.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip
                          label={transaction.category}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(transaction.category),
                            color: 'white',
                            fontSize: '0.75rem',
                            height: 20,
                          }}
                        />
                        <Chip
                          label={transaction.method}
                          size="small"
                          color={getPaymentMethodColor(transaction.method) as any}
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box textAlign="right">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {transaction.type === 'debit' ? (
                          <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
                        ) : (
                          <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                        )}
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color={transaction.type === 'debit' ? 'error.main' : 'success.main'}
                        >
                          {transaction.type === 'debit' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatTransactionDate(transaction.date)}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {transaction.description !== transaction.merchant && transaction.description}
                    </Typography>
                    {transaction.rawMessage && (
                      <Tooltip title={transaction.rawMessage} placement="bottom-start">
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px',
                            cursor: 'help',
                            mt: 0.5,
                          }}
                        >
                          SMS: {transaction.rawMessage}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                }
              />
              
              <IconButton edge="end" size="small">
                <MoreVert />
              </IconButton>
            </ListItem>
            
            {index < displayTransactions.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 9 }} />
            )}
          </React.Fragment>
        ))}
        
        {transactions.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Your transactions will appear here once you start using the app
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default TransactionsList;