import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Designation {
  designation_id: string | number;
  designation_name: string;
  department_id: string | number;
  department_name?: string;
  created_at?: string;
}

export interface CreateDesignationPayload {
  designation_name: string;
  department_id: string | number;
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
export const designationApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<Designation>>("/designations"),

  getById: (id: string | number) =>
    axiosInstance.get<ApiItemResponse<Designation>>(`/designations/${id}`),

  create: (data: CreateDesignationPayload) =>
    axiosInstance.post<{ success: boolean; message: string }>("/designations", data),

  update: (id: string | number, data: Partial<CreateDesignationPayload>) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/designations/${id}`, data),

  delete: (id: string | number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/designations/${id}`),
};
