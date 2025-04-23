import React, { useEffect, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Navigate } from 'react-router-dom';
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LeaveHistoryItem, UserRole, leaveApi } from '../services/api';
import { useSnackbar } from 'notistack';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPanel() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveHistoryItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [leaves, setLeaves] = useState<LeaveHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getLeaveHistory();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      enqueueSnackbar('Failed to fetch leaves', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    return leaves
      .filter((leave: LeaveHistoryItem) => leave.status === 0)
      .filter((leave: LeaveHistoryItem) => leave.employee.department_id === user?.departmentId);
  }, [leaves, user]);

  const pendingLeaves = useMemo(() => {
    return leaves.filter((leave: LeaveHistoryItem) => leave.status === 0);
  }, [leaves]);

  const historyLeaves = useMemo(() => {
    return leaves.filter((leave: LeaveHistoryItem) => leave.status !== 0);
  }, [leaves]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApproveClick = (request: LeaveHistoryItem) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleViewRequest = (request: LeaveHistoryItem) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: LeaveHistoryItem) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  if (!user) {
    return <div>Please log in to access this content.</div>;
  }

  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return <Navigate to="/dashboard" replace />;
  };

  const handleApprove = async (selectedRequest: LeaveHistoryItem) => {
    if (!selectedRequest || !user?.id) return;
    
    try {
      await leaveApi.updateLeaveStatus(selectedRequest.id, 1, '', user.id);
      enqueueSnackbar('Leave request approved successfully', { variant: 'success' });
      fetchLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
      enqueueSnackbar('Failed to approve leave request', { variant: 'error' });
    }
  };

  const handleReject = async (selectedRequest: LeaveHistoryItem) => {
    if (!selectedRequest || !user?.id) return;
    
    try {
      await leaveApi.updateLeaveStatus(selectedRequest.id, 2, rejectionReason, user.id);
      enqueueSnackbar('Leave request rejected successfully', { variant: 'success' });
      fetchLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      enqueueSnackbar('Failed to reject leave request', { variant: 'error' });
    }
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;
    
    try {
      await handleApprove(selectedRequest);
    } catch (error) {
      console.error('Error approving leave:', error);
      enqueueSnackbar('Failed to approve leave request', { variant: 'error' });
    }
    
    setApproveDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    
    try {
      await handleReject(selectedRequest);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      enqueueSnackbar('Failed to reject leave request', { variant: 'error' });
    }
    
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleDialogClose = () => {
    setApproveDialogOpen(false);
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getStatusChip = (status: number) => {
    switch (status) {
      case 1:
        return <Chip label="Approved" color="success" />;
      case 2:
        return <Chip label="Rejected" color="error" />;
      case 0:
      default:
        return <Chip label="Pending" color="warning" />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const currentPageData = (tabValue === 0 ? pendingLeaves : historyLeaves)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage leave requests and view leave history
          </p>
        </div>
      </div>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Pending Requests (${pendingLeaves.length})`} />
          <Tab label={`Leave History (${historyLeaves.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPageData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.employee?.names || 'Unknown Employee'}</TableCell>
                    <TableCell>{request.leaveType?.title || 'Unknown Type'}</TableCell>
                    <TableCell>
                      {request.fromDate ? format(parseISO(request.fromDate), 'MMM dd, yyyy') : 'N/A'}
                      {request.isFullDay === false && ' (Half Day)'}
                      {' - '}
                      {request.returnDate ? format(parseISO(request.returnDate), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>{Math.abs(request.days)}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApproveClick(request)}
                        className="mr-2"
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRejectClick(request)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {currentPageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending requests
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Processed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPageData.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee?.names || 'Unknown Employee'}</TableCell>
                    <TableCell>{leave.leaveType?.title || 'Unknown Type'}</TableCell>
                    <TableCell>
                      {leave?.fromDate ? format(parseISO(leave.fromDate), 'MMM dd, yyyy') : 'N/A'}
                      {leave.isFullDay === false && ' (Half Day)'}
                      {' - '}
                      {leave?.returnDate ? format(parseISO(leave.returnDate), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>{Math.abs(leave.days)}</TableCell>
                    <TableCell>{getStatusChip(leave.status)}</TableCell>
                    <TableCell>{leave.comment || '-'}</TableCell>
                    <TableCell>{leave.operator?.names || '-'}</TableCell>
                  </TableRow>
                ))}
                {currentPageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No leave history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tabValue === 0 ? pendingLeaves.length : historyLeaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Approve Leave Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this leave request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleApproveConfirm} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this leave request.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
