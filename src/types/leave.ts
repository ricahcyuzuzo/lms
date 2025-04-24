export interface Leave {
  id: string;
  employeeId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  documents?: string[];
  isHalfDay: boolean;
  approverComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  carryForward: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  profilePicture?: string;
  managerId?: string;
}
