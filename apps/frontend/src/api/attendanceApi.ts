import { axiosInstance } from "./axios";

// ── Types ──────────────────────────────────────────────────────────────────
export type AttendanceStatus = "Present" | "Absent" | "Late";

export interface Attendance {
  attendance_id: number;
  employee_id: number;
  employee_name?: string;
  attendance_date: string;
  status: AttendanceStatus;
  check_in?: string;
  check_out?: string;
  created_at?: string;
}

export interface CreateAttendancePayload {
  employee_id: number;
  attendance_date: string;
  status?: AttendanceStatus;
  check_in?: string;
  check_out?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

// ── API ────────────────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll: () =>
    axiosInstance.get<ApiListResponse<Attendance>>("/attendance"),

  create: (data: CreateAttendancePayload) =>
    axiosInstance.post<{ success: boolean; message: string; data: Attendance }>(
      "/attendance",
      data,
    ),
};
