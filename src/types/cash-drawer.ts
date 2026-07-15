export interface CashDrawerUserRef {
  _id: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  phoneNumber?: string;
  email?: string;
}

export interface CashDrawerBranchRef {
  _id: string;
  name: string;
}

export interface CashDrawerShiftLog {
  _id?: string;
  staffId: string | CashDrawerUserRef;
  amount: number;
  nextStaffId?: string | CashDrawerUserRef | null;
  note?: string;
  loggedAt: string;
}

export interface CashDrawerSession {
  _id: string;
  tenantId: string;
  branchId: string | CashDrawerBranchRef;
  businessDate: string;
  status: "OPEN" | "CLOSED";
  openingAmount: number;
  openedBy: string | CashDrawerUserRef;
  currentStaffId: string | CashDrawerUserRef;
  shiftLogs: CashDrawerShiftLog[];
  finalLog?: {
    amount: number;
    managerId: string | CashDrawerUserRef;
    note?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpenSessionPayload {
  branchId: string;
  openingAmount: number;
  staffId: string;
}

export interface ShiftLogPayload {
  amount: number;
  nextStaffId?: string;
  note?: string;
}

export interface FinalizeSessionPayload {
  finalAmount: number;
  note?: string;
}
