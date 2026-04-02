// BoxDesign AI — Auth API Service
import { apiClient } from './client';
import type { UserProfile } from '@/types/user';

export interface SendOtpResponse { success: boolean; message: string; }
export interface VerifyOtpResponse { access_token: string; userId: string; isNewUser: boolean; }
export interface GoogleAuthResponse { access_token: string; userId: string; isNewUser: boolean; }
export interface UpdateProfilePayload {
  companyName?: string; contactName?: string; gstin?: string;
  city?: string; state?: string; logoUrl?: string;
  brandColours?: string[]; brandPatternUrl?: string;
}

export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<SendOtpResponse>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<VerifyOtpResponse>('/auth/verify-otp', { phone, otp }),

  googleSignIn: (idToken: string) =>
    apiClient.post<GoogleAuthResponse>('/auth/google', { id_token: idToken }),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.put('/auth/profile', data),

  getProfile: () =>
    apiClient.get('/auth/profile'),

  logout: () =>
    apiClient.post('/auth/logout'),
};
