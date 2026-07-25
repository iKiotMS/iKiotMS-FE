export type BranchStatus = "ACTIVE" | "INACTIVE";

export interface Branch {
  _id: string;
  name: string;
  phoneNumber: string[];
  address?: string;
  email?: string;
  status: BranchStatus;
  attendanceTakingLocation?: {
    latitude: number;
    longitude: number;
    allowedRadiusMeters?: number;
    maxAccuracyMeters?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface BranchQueryParams {
  search?: string;
  status?: BranchStatus;
  page?: number;
  limit?: number;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  data: Branch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BranchCreatePayload {
  name: string;
  phoneNumber: string[];
  address?: string;
  email?: string;
  attendanceTakingLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface BranchUpdatePayload {
  name?: string;
  phoneNumber?: string[];
  address?: string;
  email?: string;
  status?: BranchStatus;
  attendanceTakingLocation?: {
    latitude: number;
    longitude: number;
  };
}
