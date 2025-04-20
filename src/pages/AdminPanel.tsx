import React, { useState } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { approveLeaveRequest, denyLeaveRequest } from '../store/leaveSlice';
import { RootState } from '../store/store';

const departmentStats = [
  {
    name: 'Engineering',
    totalEmployees: 15,
    onLeaveToday: 0,
    pendingRequests: 0,
    icon: BuildingOfficeIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'HR',
    totalEmployees: 8,
    onLeaveToday: 0,
    pendingRequests: 0,
    icon: BuildingOfficeIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Finance',
    totalEmployees: 10,
    onLeaveToday: 0,
    pendingRequests: 0,
    icon: BuildingOfficeIcon,
    color: 'bg-green-500',
  },
];

interface LeaveHistoryItem {
  id: number;
  employee: {
    name: string;
    avatar: string;
    department: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRequested: number;
}

const leaveHistory: LeaveHistoryItem[] = [];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface LeaveRequest {
  id: number;
  employee: {
    name: string;
    avatar: string;
    department: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRequested: number;
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
  // All hooks must be called before any return
  const userRole = useSelector((state: RootState) => state.auth.user.role);
  const [tabValue, setTabValue] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const dispatch = useDispatch();
  const leaveRequests = useSelector((state: RootState) => state.leave.leaveRequests);

  if (!userRole) {
    return <div>Please log in to access this content.</div>;
  }
  if (userRole !== 'admin') {
    return <div>User Panel Content</div>;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApproveClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    dispatch(approveLeaveRequest(selectedRequest?.id));
    console.log('Approved request:', selectedRequest);
    setApproveDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      return; // Don't allow empty rejection reasons
    }
    dispatch(denyLeaveRequest(selectedRequest?.id));
    console.log('Rejected request:', selectedRequest, 'Reason:', rejectionReason);
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleDialogClose = () => {
    setApproveDialogOpen(false);
    setRejectDialogOpen(false);
    setSelectedRequest(null);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Approved" color="success" />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label="Pending" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage leave requests and view department statistics
          </p>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departmentStats.map((dept) => (
          <div
            key={dept.name}
            className="relative rounded-lg bg-white shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`rounded-md ${dept.color} p-3`}>
                  <dept.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">{dept.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dept.totalEmployees}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{dept.onLeaveToday} on leave today</span>
                <span>{dept.pendingRequests} pending requests</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs for Leave Management */}
      <Paper className="mt-8">
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pending Requests" />
          <Tab label="Leave History" />
        </Tabs>

        {/* Pending Requests Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((request: LeaveRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 bg-blue-500">
                          {request.employee.avatar}
                        </Avatar>
                        <span className="ml-2">{request.employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{request.employee.department}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      {request.startDate} - {request.endDate}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({request.daysRequested} days)
                      </span>
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell align="right">
                      <Button
                        startIcon={<CheckCircleIcon className="h-5 w-5" />}
                        color="success"
                        className="mr-2"
                        onClick={() => handleApproveClick(request)}
                      >
                        Approve
                      </Button>
                      <Button
                        startIcon={<XCircleIcon className="h-5 w-5" />}
                        color="error"
                        onClick={() => handleRejectClick(request)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Approve Confirmation Dialog */}
          <Dialog
            open={approveDialogOpen}
            onClose={handleDialogClose}
            aria-labelledby="approve-dialog-title"
          >
            <DialogTitle id="approve-dialog-title">
              Confirm Leave Approval
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to approve the leave request for{' '}
                {selectedRequest?.employee.name}?
                <br />
                Duration: {selectedRequest?.startDate} - {selectedRequest?.endDate} ({selectedRequest?.daysRequested} days)
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleApproveConfirm} color="success" variant="contained">
                Approve
              </Button>
            </DialogActions>
          </Dialog>

          {/* Reject Dialog with Comment */}
          <Dialog
            open={rejectDialogOpen}
            onClose={handleDialogClose}
            aria-labelledby="reject-dialog-title"
          >
            <DialogTitle id="reject-dialog-title">
              Reject Leave Request
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                You are about to reject the leave request for {selectedRequest?.employee.name}.
                <br />
                Duration: {selectedRequest?.startDate} - {selectedRequest?.endDate} ({selectedRequest?.daysRequested} days)
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="rejection-reason"
                label="Rejection Reason"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                error={rejectDialogOpen && !rejectionReason.trim()}
                helperText={rejectDialogOpen && !rejectionReason.trim() ? 'Rejection reason is required' : ''}
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
        </TabPanel>

        {/* Leave History Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveHistory.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 bg-blue-500">
                          {leave.employee.avatar}
                        </Avatar>
                        <span className="ml-2">{leave.employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{leave.employee.department}</TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>
                      {leave.startDate} - {leave.endDate}
                      <br />
                      <span className="text-sm text-gray-500">
                        ({leave.daysRequested} days)
                      </span>
                    </TableCell>
                    <TableCell>{getStatusChip(leave.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </div>
  );
}
