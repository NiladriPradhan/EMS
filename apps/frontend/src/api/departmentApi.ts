import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Department {
  department_id: string | number;
  department_name: string;
  description?: string;
  created_at?: string;
}

export interface CreateDepartmentPayload {
  department_name: string;
  description?: string;
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
export const departmentApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<Department>>("/departments"),

  getById: (id: string | number) =>
    axiosInstance.get<ApiItemResponse<Department>>(`/departments/${id}`),

  create: (data: CreateDepartmentPayload) =>
    axiosInstance.post<{ success: boolean; message: string }>("/departments", data),

  update: (id: string | number, data: Partial<CreateDepartmentPayload>) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/departments/${id}`, data),

  delete: (id: string | number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/departments/${id}`),
};
