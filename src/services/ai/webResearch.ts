// BoxDesign AI — Web Research Service (Frontend)

import apiClient from '@/services/api/client';

/**
 * Interface representing a competitor packaging image result.
 */
export interface CompetitorImage {
  title: string;
  imageUrl: string;
  source: string;
}

/**
 * Interface representing the full research results for a product.
 */
export interface ProductResearchResult {
  competitorImages: CompetitorImage[];
  taglines: string[];
  bulletPoints: string[];
  certifications: string[];
  warnings: string[];
}

/**
 * Fetch product research data from the backend.
 * 
 * @param productName - Name of the product to research
 * @param category - Product category (e.g., Food, Electronics)
 * @param brandName - Name of the brand
 * @returns Promise resolving to the research results
 */
export async function fetchProductResearch(
  productName: string,
  category: string,
  brandName: string
): Promise<ProductResearchResult> {
  try {
    const response = await apiClient.post('/v1/design/research', {
      product_name: productName,
      category: category,
      brand_name: brandName,
    });

    // The backend returns a nested product_info object, so we map it to our interface
    const data = response.data;
    const info = data.product_info || {};

    return {
      competitorImages: (data.competitor_images || []).map((img: any) => ({
        title: img.title,
        imageUrl: img.original,
        source: img.source,
      })),
      taglines: info.taglines || [],
      bulletPoints: info.bullet_points || [],
      certifications: info.certifications || [],
      warnings: info.warnings || [],
    };
  } catch (error) {
    console.error('Error fetching product research:', error);
    throw error;
  }
}

/**
 * Enhances a user's prompt with key research insights for AI image generation.
 * 
 * @param research - The research results to pull data from
 * @param currentPrompt - The current prompt string
 * @returns An enhanced prompt string limited to 500 characters
 */
export function applyResearchToRequest(
  research: ProductResearchResult,
  currentPrompt: string
): string {
  const tagline = research.taglines.length > 0 ? research.taglines[0] : '';
  const certification = research.certifications.length > 0 ? research.certifications[0] : '';
  const warning = research.warnings.length > 0 ? research.warnings[0] : '';

  let enhancement = '';
  if (tagline) enhancement += ` Featured Tagline: "${tagline}".`;
  if (certification) enhancement += ` Certification: ${certification}.`;
  if (warning) enhancement += ` Warning: ${warning}.`;

  const finalPrompt = `${currentPrompt}${enhancement}`.trim();

  // Ensure prompt stays within reasonable length for most AI APIs
  if (finalPrompt.length > 500) {
    return finalPrompt.substring(0, 497) + '...';
  }

  return finalPrompt;
}
