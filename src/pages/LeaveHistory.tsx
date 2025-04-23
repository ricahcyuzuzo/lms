import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useSnackbar } from 'notistack';
import { leaveApi } from '../services/api';

interface LeaveType {
  id: number;
  title: string;
}

interface Employee {
  id: number;
  names: string;
}

interface LeaveHistoryItem {
  id: number;
  employee: Employee;
  leaveType: LeaveType;
  fromDate: string;
  returnDate: string;
  days: number;
  status: number;
  reason: string;
  comment?: string;
  operator?: Employee | null;
}

interface User {
  id: number;
  role: string;
}

export const LeaveHistory = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [leaves, setLeaves] = useState<LeaveHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [user] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getLeaveHistory();
      setLeaves(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load leave history');
      enqueueSnackbar('Failed to load leave history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const handleRowClick = async (leave: LeaveHistoryItem) => {
    try {
      setLoadingDetails(true);
      const details = await leaveApi.getLeaveById(leave.id);
      console.log('Leave details response:', details);
      setSelectedLeave(details);
      setDetailsOpen(true);
      setComment('');
    } catch (error) {
      console.error('Error fetching leave details:', error);
      enqueueSnackbar('Failed to load leave details', { variant: 'error' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (status: number) => {
    if (!selectedLeave || !user?.id) return;
    
    try {
      setUpdating(true);
      await leaveApi.updateLeaveStatus(selectedLeave.id, status, comment, user.id);
      enqueueSnackbar('Leave status updated successfully', { variant: 'success' });
      setDetailsOpen(false);
      fetchLeaveHistory(); // Refresh the list
    } catch (error) {
      console.error('Error updating leave status:', error);
      enqueueSnackbar('Failed to update leave status', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusChip = (status: number) => {
    const statusMap = {
      0: { text: 'PENDING', classes: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'APPROVED', classes: 'bg-green-100 text-green-800' },
      2: { text: 'REJECTED', classes: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0];
    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusInfo.classes}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Only show approve/reject buttons if user is admin
  const canManageLeaves = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr
                key={leave.id}
                onClick={() => handleRowClick(leave)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">{leave.employee?.names || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType?.title || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(leave.fromDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(leave.returnDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.days || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(leave.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailsOpen && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Leave Details</h2>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingDetails || updating ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee</p>
                      <p className="mt-1">{selectedLeave.employee?.names || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Leave Type</p>
                      <p className="mt-1">{selectedLeave.leaveType?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">From Date</p>
                      <p className="mt-1">{formatDate(selectedLeave.fromDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Return Date</p>
                      <p className="mt-1">{formatDate(selectedLeave.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Days</p>
                      <p className="mt-1">{selectedLeave.days || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="mt-1">{getStatusChip(selectedLeave.status)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Reason</p>
                      <p className="mt-1">{selectedLeave.reason || 'N/A'}</p>
                    </div>
                  </div>

                  {canManageLeaves && selectedLeave.status === 0 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                          Comment
                        </label>
                        <textarea
                          id="comment"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleUpdateStatus(2)}
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(1)}
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
