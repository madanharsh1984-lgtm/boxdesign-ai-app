// ─── BoxDesign AI — API Response Wrapper Types ───────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type ApiError = {
  code: string;
  message: string;
  field?: string;
};

// Generation job polling
export type GenerationStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface GenerationJob {
  jobId: string;
  status: GenerationStatus;
  progress: number;      // 0–100
  currentStep: string;   // e.g. "Generating Theme 3/10"
  estimatedSecondsLeft?: number;
}
