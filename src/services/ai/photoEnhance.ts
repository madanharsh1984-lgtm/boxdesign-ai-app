// BoxDesign AI — Photo Enhancement Service (Frontend)
import { apiClient } from '@/services/api/client';
import { API_BASE_URL } from '@/utils/constants';

export interface EnhancedPhotoResult {
  jobId: string;
  originalUri: string;
  enhancedUrl: string;
  bgRemovedUrl: string;
  qualityScore: number;
  issues: string[];
}

export interface QualityResult {
  score: number;
  issues: string[];
  recommendation: string;
  label: 'good' | 'low_light' | 'blurry' | 'low_res';
}

/**
 * Uploads a photo and starts the enhancement process. 
 * Polls the status endpoint until processing is complete.
 */
export async function uploadAndEnhancePhoto(localUri: string, jobId: string): Promise<EnhancedPhotoResult> {
  const formData = new FormData();
  
  // Extract filename and determine type
  const filename = localUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  // Construct file object for FormData
  // Note: For React Native, use { uri, name, type }
  // For web, you might need to fetch the blob first. 
  // Here we assume a standard browser/mobile compatible FormData append.
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: type,
  } as any);
  formData.append('jobId', jobId);

  try {
    // 1. Upload and start process
    await apiClient.post(`${API_BASE_URL}/v1/design/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 2. Poll for status
    let completed = false;
    let result: EnhancedPhotoResult | null = null;

    while (!completed) {
      // Wait 2 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await apiClient.get(`${API_BASE_URL}/v1/design/enhance-status/${jobId}`);
      const data = response.data;

      if (data.status === 'completed') {
        completed = true;
        result = {
          jobId: data.job_id,
          originalUri: data.original,
          enhancedUrl: data.enhanced,
          bgRemovedUrl: data.bg_removed,
          qualityScore: data.quality.score,
          issues: data.quality.issues,
        };
      } else if (data.status === 'failed') {
        throw new Error(`Photo enhancement failed: ${data.error || 'Unknown error'}`);
      }
      // If 'pending' or 'processing', loop continues
    }

    if (!result) {
      throw new Error('Enhancement completed but no result returned.');
    }

    return result;
  } catch (error) {
    console.error('Error in uploadAndEnhancePhoto:', error);
    throw error;
  }
}

/**
 * Assesses the quality of a photo without performing full enhancement.
 */
export async function assessPhotoQuality(localUri: string): Promise<QualityResult> {
  const formData = new FormData();
  const filename = localUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append('file', {
    uri: localUri,
    name: filename,
    type: type,
  } as any);

  try {
    const response = await apiClient.post(`${API_BASE_URL}/v1/design/assess-quality`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    
    // Map backend response to QualityResult
    // Logic for label mapping
    let label: QualityResult['label'] = 'good';
    if (data.issues.includes('blurry')) label = 'blurry';
    else if (data.issues.includes('low_res')) label = 'low_res';
    else if (data.issues.includes('too_dark') || data.issues.includes('overexposed')) label = 'low_light';

    return {
      score: data.score,
      issues: data.issues,
      recommendation: data.recommendation,
      label: label,
    };
  } catch (error) {
    console.error('Error in assessPhotoQuality:', error);
    throw error;
  }
}
