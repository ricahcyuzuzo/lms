import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

type UserRole = 'USER' | 'ADMIN' | 'MANAGER';

interface User {
  id: number;
  names: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  role: UserRole;
  status: number;
  lastLogin: string;
  createdAt: string;
}

export interface LeaveRequest {
  employee: number;
  leaveTypeId: number;
  reason: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  fromDate: string;
  isFullDay: boolean;
  returnDate: string;
}

export interface LeaveResponse extends LeaveRequest {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveType {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypesResponse {
  status: number;
  data: LeaveType[];
}

export interface LoginResponse {
  token: string;
  id: number;
  names: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  role: UserRole;
  status: number;
  lastLogin: string;
  createdAt: string;
}

export interface Employee {
  id: number;
  names: string;
  department_id: number;
  role: string;
}

export interface LeaveTypeDetail {
  id: number;
  title: string;
}

export interface LeaveHistoryItem {
  id: number;
  employee: {
    id: number;
    names: string;
    department_id: number;
    role: string;
  };
  leaveType: {
    id: number;
    title: string;
  };
  reason: string;
  days: number;
  status: number;
  comment: string;
  fromDate: string;
  isFullDay: boolean;
  operator?: {
    id: number;
    names: string;
    department_id: number;
    role: string;
  };
  returnDate: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveHistoryResponse {
  status: number;
  data: LeaveHistoryItem[];
}

export interface LeaveBalance {
  leaveType: LeaveTypeDetail;
  total: number;
  used: number;
  remaining: number;
}

export interface DashboardData {
  status: number;
  data: {
    leaveBalances: LeaveBalance[];
    upcomingLeaves: LeaveHistoryItem[];
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  
  register: async (names: string, email: string, departmentId: number, role: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/register', {
      names,
      email,
      departmentId,
      role
    });
    return response.data;
  },
};

export const leaveApi = {
  applyLeave: async (leaveRequest: Omit<LeaveRequest, 'status'>): Promise<LeaveResponse> => {
    const request = {
      ...leaveRequest,
      status: 'Pending' as const
    };
    const response = await api.post<LeaveResponse>('/api/leaves', request);
    return response.data;
  },
  
  getLeaveHistory: async (): Promise<LeaveHistoryResponse> => {
    const response = await api.get<LeaveHistoryResponse>('/api/leaves');
    return response.data;
  },

  getLeaveById: async (leaveId: number): Promise<LeaveHistoryItem> => {
    const response = await api.get<{ status: number; data: LeaveHistoryItem }>(`/api/leaves/${leaveId}`);
    return response.data.data;
  },

  getEmployeeLeaves: async (employeeId: number): Promise<LeaveHistoryItem[]> => {
    const response = await api.get<LeaveHistoryResponse>(`/api/leaves/employee/${employeeId}`);
    return response.data.data;
  },

  getDashboardData: async (employeeId: number): Promise<DashboardData['data']> => {
    const response = await api.get<DashboardData>(`/api/leave-balance/${employeeId}/report`);
    return response.data.data;
  },

  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await api.get<LeaveTypesResponse>('/api/leave-types');
    return response.data.data;
  },

  updateLeaveStatus: async (leaveId: number, status: number, comment: string, operatorId: number) => {
    const response = await api.put(`/api/leaves/${leaveId}`, {
      status,
      comment,
      operator: operatorId
    });
    return response.data;
  },

  // Removed old PATCH methods for approve/reject since we're using a single PUT endpoint
  // approveLeave: async (leaveId: number, comment: string = ''): Promise<LeaveHistoryItem> => {
  //   const response = await api.patch<LeaveHistoryItem>(`/api/leave/${leaveId}/approve`, { comment });
  //   return response.data;
  // },

  // rejectLeave: async (leaveId: number, comment: string): Promise<LeaveHistoryItem> => {
  //   const response = await api.patch<LeaveHistoryItem>(`/api/leave/${leaveId}/reject`, { comment });
  //   return response.data;
  // }
};

export const notificationsApi = {
  getUserNotifications: async (userId: number) => {
    const response = await api.get(`/api/notifications/user/${userId}`);
    return response.data.data;
  },
  markAsRead: async (notifId: number, operator: number) => {
    const response = await api.put(`/api/notifications/${notifId}/read`, {
      status: 1,
      comment: '',
      operator,
    });
    return response.data;
  },
};

export const usersApi = {
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data.data;
  },
};

export type { User, UserRole };
export default api;
