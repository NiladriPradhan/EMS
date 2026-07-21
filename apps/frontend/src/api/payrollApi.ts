import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export type PaymentStatus = "Unpaid" | "Paid" | "Pending";

export interface SalaryRecord {
  _id?: string;
  salary_id?: number;
  salary_record_id?: number;
  employee_id: any;
  employee_name?: string;
  salary_month: number;
  salary_year: number;
  basic_salary: number;
  hra: number;
  da: number;
  ta: number;
  medical_allowance: number;
  other_allowance: number;
  gross_salary: number;
  pf: number;
  esi: number;
  professional_tax: number;
  income_tax: number;
  total_deductions: number;
  net_salary: number;
  payment_status: PaymentStatus;
  generated_by?: number;
  created_at?: string;
}

export interface GenerateSalaryPayload {
  employee_id: number;
  salary_month: number;
  salary_year: number;
}

export interface Payslip extends SalaryRecord {
  first_name?: string;
  last_name?: string;
  department_name?: string;
  designation_name?: string;
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

export const getSalaryRecordId = (rec: SalaryRecord): any =>
  rec._id ?? rec.salary_id ?? rec.salary_record_id;

// ── API ────────────────────────────────────────────────────────────────────
export const payrollApi = {
  getPayslips: () =>
    axiosInstance.get<ApiListResponse<SalaryRecord>>("/salaries/payslips"),

  getAll: () =>
    axiosInstance.get<ApiListResponse<SalaryRecord>>("/salaries"),

  getById: (id: number) =>
    axiosInstance.get<ApiItemResponse<SalaryRecord>>(`/salaries/${id}`),

  generate: (data: GenerateSalaryPayload) =>
    axiosInstance.post<ApiItemResponse<{ gross_salary: number; net_salary: number; total_deductions: number }>>(
      "/salaries/generate",
      data,
    ),

  markAsPaid: (id: string | number) =>
    axiosInstance.patch<{ success: boolean; message: string }>(`/salaries/${id}/pay`, {}),

  delete: (id: string | number) =>
    axiosInstance.delete<{ success: boolean; message: string }>(`/salaries/${id}`),

  getPayslip: (id: string | number) =>
    axiosInstance.get<ApiItemResponse<Payslip>>(`/salaries/payslips/${id}`),
};
