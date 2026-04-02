// BoxDesign AI — Design Generation Service (Frontend)
import { apiClient } from '@/services/api/client';
import { DesignRequest, DesignThemeResult } from '@/types/design';

/**
 * Interface for the polling response from the backend generation service.
 */
export interface GenerationPollResult {
  jobId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  currentStep: string;
  designs?: DesignThemeResult[];
}

/**
 * Initiates the AI design generation process on the backend.
 * 
 * @param request - Partial design request details (brand name, product, etc.)
 * @returns A promise resolving to the unique jobId for the generation request.
 */
export async function startDesignGeneration(request: Partial<DesignRequest>): Promise<string> {
  const response = await apiClient.post<{ jobId: string }>('/v1/design/generate', request);
  return response.data.jobId;
}

/**
 * Fetches the current status of a background generation job.
 * 
 * @param jobId - The unique identifier for the generation job.
 * @returns A promise resolving to the GenerationPollResult.
 */
export async function pollGenerationStatus(jobId: string): Promise<GenerationPollResult> {
  const response = await apiClient.get<GenerationPollResult>(`/v1/design/status/${jobId}`);
  return response.data;
}

/**
 * Polling helper that waits for a generation job to complete or time out.
 * 
 * @param jobId - The job ID to monitor.
 * @param onProgress - Callback triggered every poll interval to update UI.
 * @returns A promise resolving to the final array of design themes.
 * @throws Error if the job fails or times out (120 seconds).
 */
export function waitForCompletion(
  jobId: string,
  onProgress: (step: string, pct: number) => void
): Promise<DesignThemeResult[]> {
  return new Promise((resolve, reject) => {
    const timeout = 120000; // 120 seconds
    const intervalTime = 2000; // 2 seconds
    let elapsed = 0;

    const interval = setInterval(async () => {
      try {
        elapsed += intervalTime;
        if (elapsed >= timeout) {
          clearInterval(interval);
          reject(new Error('Design generation timed out after 120 seconds.'));
          return;
        }

        const result = await pollGenerationStatus(jobId);
        onProgress(result.currentStep, result.progress);

        if (result.status === 'complete' && result.designs) {
          clearInterval(interval);
          resolve(result.designs);
        } else if (result.status === 'failed') {
          clearInterval(interval);
          reject(new Error('Design generation failed on server.'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, intervalTime);
  });
}
