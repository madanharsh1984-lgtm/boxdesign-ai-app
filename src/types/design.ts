// ─── BoxDesign AI — Design & Request Types ───────────────────────────────────

export type BoxStyle = 'RSC' | 'Die-cut' | 'Tuck-end' | 'Mailer' | 'Custom';
export type Unit     = 'mm' | 'cm' | 'inches';
export type Category = 'Food' | 'Electronics' | 'FMCG' | 'Pharma' | 'E-commerce' | 'Industrial' | 'Other';
export type Market   = 'Retail' | 'Online' | 'Export';
export type FontStyle= 'Modern' | 'Classic' | 'Bold' | 'Handwritten' | 'Minimal';

export type DesignTheme =
  | 'Minimalist' | 'Bold' | 'Premium' | 'Earthy'
  | 'Industrial' | 'Playful' | 'Monochrome'
  | 'Gradient'   | 'Pattern' | 'Brand-matched';

export interface BoxDimensions {
  length: number;
  width:  number;
  height: number;
  unit:   Unit;
  style:  BoxStyle;
  productWeightKg?: number;
}

export interface DesignRequest {
  // Step 1 — Box
  dimensions: BoxDimensions;
  quantity?: number;

  // Step 2 — Photos
  photoUris: string[];         // local device URIs before upload
  photoUrls?: string[];        // remote URLs after upload
  useWebImages?: boolean;
  useAIImages?: boolean;

  // Step 3 — Brand
  brandName: string;
  tagline?: string;
  productName: string;
  category: Category;
  targetMarket: Market;
  preferredColours?: string[];
  fontStyle?: FontStyle;
  prompt?: string;

  // Step 4 — Options
  useExistingPattern?: boolean;
  includeCompetitorResearch?: boolean;
  autoFillProductInfo?: boolean;
  barcodeNumber?: string;
  boxStyle?: BoxStyle;
  weight?: number;
  includeQrCode?: boolean;
  useWebResearch?: boolean;
}

export interface DesignThemeResult {
  id: string;
  theme: DesignTheme;
  thumbnailUrl: string;
  flatDesignUrl: string;
  model3dUrl?: string;
  colourPalette: string[];
  fonts: string[];
  isFavourite?: boolean;
  themeName?: string;
  thumbnailColor?: string;
  imageUrl?: string;
}

export interface GeneratedDesigns {
  jobId: string;
  requestId?: string;
  designs: DesignThemeResult[];
  sheetSizeRecommendation?: SheetSizeRecommendation;
  productInfoSuggestions?: ProductInfoSuggestions;
  generatedAt: string;
}

export interface SheetSizeRecommendation {
  sheetWidthMm:  number;
  sheetHeightMm: number;
  gsmRecommended: number;
  fluteType: string;
  numberUp: number;
  wastePercent: number;
}

export interface ProductInfoSuggestions {
  taglines: string[];
  bulletPoints: string[];
  certifications: string[];
  warnings: string[];
}
