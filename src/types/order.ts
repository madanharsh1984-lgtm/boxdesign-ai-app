// ─── BoxDesign AI — Order & Payment Types ────────────────────────────────────

export type OrderStatus  = 'draft' | 'approved' | 'paid' | 'generating' | 'delivered' | 'failed';
export type PricingTier  = 'basic' | 'standard' | 'premium';
export type FileType     = 'pdf' | 'png' | 'cdr';

export interface PricingPlan {
  tier:        PricingTier;
  label:       string;
  priceInr:    number;
  files:       FileType[];
  revisions:   number;
  description: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'basic',
    label: 'Basic',
    priceInr: 299,
    files: ['pdf'],
    revisions: 0,
    description: 'PDF flat design only',
  },
  {
    tier: 'standard',
    label: 'Standard',
    priceInr: 799,
    files: ['pdf', 'png', 'cdr'],
    revisions: 1,
    description: 'PDF + PNG + CDR, 1 revision',
  },
  {
    tier: 'premium',
    label: 'Premium',
    priceInr: 1499,
    files: ['pdf', 'png', 'cdr'],
    revisions: 3,
    description: 'All files + source layers + 3 revisions + priority support',
  },
];

export interface Order {
  id: string;
  userId: string;
  designRequestId: string;
  selectedDesignId: string;
  pricingTier: PricingTier;
  status: OrderStatus;
  totalAmountInr: number;
  gstAmountInr: number;
  promoCode?: string;
  discountInr?: number;
  paymentId?: string;
  approvedByName?: string;
  approvedAt?: string;
  files?: DeliveredFile[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveredFile {
  type: FileType;
  url: string;         // Signed URL (expires in 90 days)
  sizeBytes: number;
  expiresAt: string;
}

export interface PaymentIntent {
  orderId: string;
  razorpayOrderId: string;
  amount: number;      // in paise
  currency: 'INR';
  keyId: string;
}
