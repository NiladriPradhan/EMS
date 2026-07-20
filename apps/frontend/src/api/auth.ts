import { axiosInstance } from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      user_id: number;
      username: string;
      email: string;
      role_id: number;
      status: string;
    };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface DirectResetPasswordRequest {
  email: string;
  new_password: string;
  confirm_password: string;
}


export interface User {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
  status: string;
  permissions?: string[]; // optional now
}

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponse>("/auth/login", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosInstance.post("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post("/auth/reset-password", data),

  directResetPassword: (data: DirectResetPasswordRequest) =>
    axiosInstance.post("/auth/direct-reset-password", data),

  getCurrentUser: () =>
    axiosInstance.get<{ success: boolean; data: User }>("/auth/me"),

  logout: () => axiosInstance.post("/auth/logout"),
};
