// ─── BoxDesign AI — User & Profile Types ─────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  email?: string;
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  companyName: string;
  contactName: string;
  gstin?: string;
  city: string;
  state: string;
  logoUrl?: string;
  brandColours?: string[];      // hex strings e.g. ['#1A3C6E', '#E67E22']
  brandPatternUrl?: string;
}

export interface BrandAsset {
  id: string;
  type: 'logo' | 'pattern' | 'colour_palette';
  url?: string;
  colours?: string[];
  uploadedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
