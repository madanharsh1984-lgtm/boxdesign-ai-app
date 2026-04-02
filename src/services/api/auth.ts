// BoxDesign AI — Auth API Service
import { apiClient } from './client';

export interface SendOtpResponse { success: boolean; message: string; }
export interface VerifyOtpResponse { token: string; userId: string; isNewUser: boolean; }
export interface GoogleAuthResponse { token: string; userId: string; isNewUser: boolean; }
export interface UpdateProfilePayload {
  companyName: string; contactName: string; gstin?: string;
  city: string; state: string; logoUrl?: string;
  brandColours?: string[]; brandPatternUrl?: string;
}

export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<SendOtpResponse>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<VerifyOtpResponse>('/auth/verify-otp', { phone, otp }),

  googleSignIn: (idToken: string) =>
    apiClient.post<GoogleAuthResponse>('/auth/google', { id_token: idToken }),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put('/auth/profile', payload),

  getProfile: () =>
    apiClient.get('/auth/profile'),

  logout: () =>
    apiClient.post('/auth/logout'),
};
