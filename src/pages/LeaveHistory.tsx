import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { useLeaveStore } from '../store/leaveStore';
import type { LeaveRequest } from '../store/leaveStore';

export default function LeaveHistory() {
  const leaveRequests = useLeaveStore((state) => state.leaveRequests);

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h4" gutterBottom>
        Leave History
      </Typography>
      <Paper className="mt-6">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request: LeaveRequest) => (
                <TableRow key={request.id}>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{format(request.startDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(request.endDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {Math.ceil(
                      (request.endDate.getTime() - request.startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    days
                  </TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
