import { create } from 'zustand';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  leaveBalance: {
    vacation: number;
    sick: number;
    personal: number;
  };
}

interface LeaveStore {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void;
  approveLeaveRequest: (id: string) => void;
  denyLeaveRequest: (id: string) => void;
  getEmployeeLeaveRequests: (employeeId: string) => LeaveRequest[];
  getDepartmentLeaveRequests: (department: string) => LeaveRequest[];
}

// Sample data
const sampleEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'John Doe',
    department: 'Engineering',
    leaveBalance: {
      vacation: 15,
      sick: 10,
      personal: 5,
    },
  },
  {
    id: 'emp2',
    name: 'Jane Smith',
    department: 'HR',
    leaveBalance: {
      vacation: 12,
      sick: 10,
      personal: 5,
    },
  },
  {
    id: 'emp3',
    name: 'Bob Wilson',
    department: 'Finance',
    leaveBalance: {
      vacation: 18,
      sick: 10,
      personal: 5,
    },
  },
];

const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave1',
    employeeId: 'emp1',
    type: 'vacation',
    startDate: new Date(2025, 4, 1),
    endDate: new Date(2025, 4, 5),
    status: 'approved',
    reason: 'Family vacation',
  },
  {
    id: 'leave2',
    employeeId: 'emp2',
    type: 'sick',
    startDate: new Date(2025, 4, 10),
    endDate: new Date(2025, 4, 11),
    status: 'pending',
    reason: 'Doctor appointment',
  },
];

export const useLeaveStore = create<LeaveStore>((set, get) => ({
  employees: sampleEmployees,
  leaveRequests: sampleLeaveRequests,

  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `leave${Date.now()}`,
      status: 'pending',
    };
    set((state) => ({
      leaveRequests: [...state.leaveRequests, newRequest],
    }));
  },

  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((request) =>
        request.id === id ? { ...request, status } : request
      ),
    }));
  },

  approveLeaveRequest: (id: string) => {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((request) =>
        request.id === id ? { ...request, status: 'approved' } : request
      ),
    }));
  },

  denyLeaveRequest: (id: string) => {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((request) =>
        request.id === id ? { ...request, status: 'rejected' } : request
      ),
    }));
  },

  getEmployeeLeaveRequests: (employeeId: string) => {
    return get().leaveRequests.filter((request) => request.employeeId === employeeId);
  },

  getDepartmentLeaveRequests: (department: string) => {
    const departmentEmployees = get().employees
      .filter((emp) => emp.department === department)
      .map((emp) => emp.id);
    return get().leaveRequests.filter((request) =>
      departmentEmployees.includes(request.employeeId)
    );
  },
}));
