// BoxDesign AI — Design API Service
import { apiClient } from './client';
import type { DesignRequest } from '@/types/design';

export interface GenerateResponse { job_id: string; status: string; estimated_seconds: number; }
export interface StatusResponse {
  job_id: string; status: 'queued'|'processing'|'complete'|'failed';
  progress: number; current_step: string; designs?: any[];
}
export interface PriceResponse {
  tier: string; base_inr: number; discount_inr: number; gst_inr: number;
  total_inr: number; total_paise: number;
}
export interface ResearchResponse {
  competitor_images: { title: string; imageUrl: string; source: string; }[];
  product_info: { taglines: string[]; bullet_points: string[]; certifications: string[]; warnings: string[]; };
  research_completed: boolean;
}

export const designApi = {
  generate: (request: Partial<DesignRequest>) =>
    apiClient.post<GenerateResponse>('/design/generate', {
      length_mm: request.dimensions?.length,
      width_mm: request.dimensions?.width,
      height_mm: request.dimensions?.height,
      box_style: request.boxStyle || 'RSC',
      quantity: request.quantity,
      weight_kg: request.weight,
      brand_name: request.brandName || '',
      product_name: request.productName || '',
      category: request.category || 'Other',
      tagline: request.tagline || '',
      preferred_colours: (request.preferredColours || []).join(','),
      prompt: request.prompt,
      use_web_research: request.useWebResearch ?? true,
      barcode_number: request.barcodeNumber,
    }),

  getStatus: (jobId: string) =>
    apiClient.get<StatusResponse>(`/design/status/${jobId}`),

  getResult: (jobId: string) =>
    apiClient.get(`/design/result/${jobId}`),

  calculatePrice: (tier: string, promoCode?: string) =>
    apiClient.post<PriceResponse>('/design/calculate-price', { tier, promo_code: promoCode || null }),

  runResearch: (productName: string, category: string, brandName: string) =>
    apiClient.post<ResearchResponse>('/design/research', { product_name: productName, category, brand_name: brandName }),

  uploadPhoto: (formData: FormData) =>
    apiClient.post('/design/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),

  assessPhotoQuality: (formData: FormData) =>
    apiClient.post('/design/assess-quality', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
