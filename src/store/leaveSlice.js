import { createSlice } from '@reduxjs/toolkit';

// Define generateId function
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const initialState = {
  employees: [],
  leaveRequests: [], // Reset leave requests
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    addLeaveRequest: (state, action) => {
      state.leaveRequests.push({ ...action.payload, id: generateId(), status: 'pending' });
    },
    updateLeaveStatus: (state, action) => {
      const { id, status } = action.payload;
      const request = state.leaveRequests.find((req) => req.id === id);
      if (request) {
        request.status = status;
      }
    },
    approveLeaveRequest: (state, action) => {
      const request = state.leaveRequests.find((req) => req.id === action.payload);
      if (request) {
        request.status = 'approved';
      }
    },
    denyLeaveRequest: (state, action) => {
      const request = state.leaveRequests.find((req) => req.id === action.payload);
      if (request) {
        request.status = 'rejected';
      }
    },
  },
});

export const { addLeaveRequest, updateLeaveStatus, approveLeaveRequest, denyLeaveRequest } = leaveSlice.actions;

export default leaveSlice.reducer;
