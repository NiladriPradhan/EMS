import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
export type LeaveType = "Sick" | "Casual" | "Annual" | "Other";

export interface Leave {
  leave_id: number;
  employee_id: number;
  employee_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: LeaveStatus;
  approved_by?: number;
  created_at?: string;
}

export interface CreateLeavePayload {
  employee_id?: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days?: number;
  reason?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface ApiItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── API ────────────────────────────────────────────────────────────────────
export const leaveApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<Leave>>("/leaves"),

  getById: (id: number) =>
    axiosInstance.get<ApiItemResponse<Leave>>(`/leaves/${id}`),

  create: (data: CreateLeavePayload) =>
    axiosInstance.post<{ success: boolean; message: string }>("/leaves", data),

  update: (id: number, data: Partial<CreateLeavePayload>) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/leaves/${id}`, data),

  approve: (id: number) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/leaves/${id}/approve`, {}),

  reject: (id: number) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/leaves/${id}/reject`, {}),

  cancel: (id: number) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/leaves/${id}/cancel`, {}),

  reopen: (id: number, data: Partial<CreateLeavePayload>) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/leaves/${id}/reopen`, data),

  delete: (id: number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/leaves/${id}`),
};
