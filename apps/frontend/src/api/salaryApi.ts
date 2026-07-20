import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export interface SalaryStructure {
  salary_structure_id: number;
  employee_id: number;
  employee_name?: string;
  basic_salary: number;
  hra: number;
  da: number;
  ta: number;
  medical_allowance: number;
  other_allowance: number;
  pf: number;
  esi: number;
  professional_tax: number;
  income_tax: number;
  status: "Active" | "Inactive";
  created_at?: string;
}

export interface CreateSalaryStructurePayload {
  employee_id: number;
  basic_salary: number;
  hra: number;
  da: number;
  ta: number;
  medical_allowance: number;
  other_allowance: number;
  pf: number;
  esi: number;
  professional_tax: number;
  income_tax: number;
  status: "Active" | "Inactive";
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
export const salaryApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<SalaryStructure>>("/salary-structures"),

  getById: (id: number) =>
    axiosInstance.get<ApiItemResponse<SalaryStructure>>(`/salary-structures/${id}`),

  create: (data: CreateSalaryStructurePayload) =>
    axiosInstance.post<{ success: boolean; message: string }>("/salary-structures", data),

  update: (id: number, data: Partial<CreateSalaryStructurePayload>) =>
    axiosInstance.put<{ success: boolean; message: string }>(`/salary-structures/${id}`, data),

  delete: (id: number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/salary-structures/${id}`),
};
