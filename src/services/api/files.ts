// BoxDesign AI — File Download API Service
import { apiClient } from './client';

export interface FileLinks {
  pdf_url: string; png_url: string; cdr_url: string;
  spec_sheet_url?: string; expires_at: string;
}

export const filesApi = {
  getDownloadLinks: (orderId: string) =>
    apiClient.get<FileLinks>(`/files/links/${orderId}`),

  refreshLinks: (orderId: string) =>
    apiClient.post<FileLinks>(`/files/refresh/${orderId}`),

  getSignedUrl: (key: string) =>
    apiClient.get<{ url: string }>(`/files/signed-url`, { params: { key } }),
};
