// StudentPaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const StudentPaymentStatus = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('/api/payments/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      setError('Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'verified':
        return <Chip icon={<CheckCircleIcon />} label="Verified" color="success" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" />;
      case 'rejected':
        return <Chip icon={<ErrorIcon />} label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const getVerificationStep = (payment) => {
    const steps = [
      { label: 'Submitted', completed: true },
      { label: 'Registrar', completed: payment.status === 'verified' || payment.status === 'rejected' },
      { label: 'Library', completed: payment.library_verified },
      { label: 'Cafeteria', completed: payment.cafeteria_verified },
      { label: 'Dormitory', completed: payment.dormitory_verified },
    ];
    return steps;
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Payment Status
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Track your payment verification progress across departments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {payments.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Payments Found
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              You haven't submitted any payments yet.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/payment')}
            >
              Make Payment
            </Button>
          </Paper>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      Payment #{payment.id} - {payment.payment_method.toUpperCase()}
                    </Typography>
                    
                    <Box sx={{ mt: 3, mb: 3 }}>
                      <Stepper alternativeLabel>
                        {getVerificationStep(payment).map((step, index) => (
                          <Step key={step.label} completed={step.completed}>
                            <StepLabel>{step.label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="textSecondary">
                          Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {payment.amount} ETB
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="textSecondary">
                          Transaction ID
                        </Typography>
                        <Typography variant="body1">
                          {payment.transaction_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="textSecondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="textSecondary">
                          Overall Status
                        </Typography>
                        {getStatusChip(payment.status)}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Department Verifications
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Library</TableCell>
                            <TableCell align="right">
                              {payment.library_verified ? 
                                <Chip size="small" label="Verified" color="success" /> : 
                                <Chip size="small" label="Pending" color="warning" />
                              }
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cafeteria</TableCell>
                            <TableCell align="right">
                              {payment.cafeteria_verified ? 
                                <Chip size="small" label="Verified" color="success" /> : 
                                <Chip size="small" label="Pending" color="warning" />
                              }
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Dormitory</TableCell>
                            <TableCell align="right">
                              {payment.dormitory_verified ? 
                                <Chip size="small" label="Verified" color="success" /> : 
                                <Chip size="small" label="Pending" color="warning" />
                              }
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default StudentPaymentStatus;