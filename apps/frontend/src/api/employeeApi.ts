import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export interface Employee {
  employee_id: string | number;
  user_id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  hire_date?: string;
  department_id?: string | number;
  department_name?: string;
  designation_id?: string | number;
  designation_name?: string;
  status?: string;
  role_id?: string | number;
}

export interface CreateEmployeePayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  hire_date?: string;
  department_id?: string | number;
  designation_id?: string | number;
  role_id?: string | number;
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
export const employeeApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<Employee>>("/employees"),

  getById: (id: string | number) =>
    axiosInstance.get<ApiItemResponse<Employee>>(`/employees/${id}`),

  create: (data: CreateEmployeePayload) =>
    axiosInstance.post<ApiItemResponse<Employee>>("/employees", data),

  update: (id: string | number, data: Partial<CreateEmployeePayload>) =>
    axiosInstance.put<ApiItemResponse<Employee>>(`/employees/${id}`, data),

  delete: (id: string | number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/employees/${id}`),
};
