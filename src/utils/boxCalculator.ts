// ─── BoxDesign AI — Box & Sheet Size Calculator ──────────────────────────────
import type { BoxDimensions, SheetSizeRecommendation } from '@/types/design';

/** Convert any unit to mm */
export function toMm(value: number, unit: BoxDimensions['unit']): number {
  switch (unit) {
    case 'cm':     return value * 10;
    case 'inches': return value * 25.4;
    default:       return value;
  }
}

/**
 * RSC (Regular Slotted Container) blank size formula:
 *   Blank Width  = 2 × (L + W) + manufacturer's joint (~35mm)
 *   Blank Height = H + (W/2) + (W/2) + top/bottom flaps
 */
export function calcRSCBlankSize(
  lengthMm: number,
  widthMm: number,
  heightMm: number
): { blankWidthMm: number; blankHeightMm: number } {
  const joint = 35;
  const blankWidthMm  = 2 * (lengthMm + widthMm) + joint;
  const blankHeightMm = heightMm + widthMm + 25; // 25mm for glue tabs
  return { blankWidthMm, blankHeightMm };
}

/** Standard corrugated sheet sizes (W × H in mm) */
const STANDARD_SHEETS: Array<[number, number]> = [
  [900,  700],
  [900,  800],
  [1000, 700],
  [1000, 800],
  [1100, 900],
  [1200, 900],
  [1200, 1000],
];

/** Recommend sheet size, number-up, and GSM for given box dimensions */
export function recommendSheetSize(
  dims: BoxDimensions,
  productWeightKg = 1
): SheetSizeRecommendation {
  const L = toMm(dims.length, dims.unit);
  const W = toMm(dims.width,  dims.unit);
  const H = toMm(dims.height, dims.unit);

  const { blankWidthMm, blankHeightMm } = calcRSCBlankSize(L, W, H);

  // Find smallest sheet that fits at least 1 blank (3mm bleed each side)
  const bW = blankWidthMm  + 6;
  const bH = blankHeightMm + 6;

  let bestSheet = STANDARD_SHEETS[STANDARD_SHEETS.length - 1];
  let bestNumberUp = 1;

  for (const [sW, sH] of STANDARD_SHEETS) {
    const cols = Math.floor(sW / bW);
    const rows = Math.floor(sH / bH);
    if (cols >= 1 && rows >= 1) {
      const numUp = cols * rows;
      if (numUp >= bestNumberUp) {
        bestNumberUp = numUp;
        bestSheet = [sW, sH];
      }
      break;
    }
  }

  // GSM recommendation based on product weight
  let gsmRecommended = 150;
  let fluteType = 'E';
  if (productWeightKg > 10) { gsmRecommended = 200; fluteType = 'B'; }
  else if (productWeightKg > 5) { gsmRecommended = 180; fluteType = 'B'; }
  else if (productWeightKg > 2) { gsmRecommended = 160; fluteType = 'C'; }

  const wastePercent = Math.round(
    (1 - (bestNumberUp * bW * bH) / (bestSheet[0] * bestSheet[1])) * 100
  );

  return {
    sheetWidthMm:   bestSheet[0],
    sheetHeightMm:  bestSheet[1],
    gsmRecommended,
    fluteType,
    numberUp:       bestNumberUp,
    wastePercent,
  };
}
