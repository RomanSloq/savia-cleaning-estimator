export const PRICING = Object.freeze({
  area: Object.freeze({
    minimum: 20,
    maximum: 500,
  }),
  minimumOrder: 3000,
  roundingIncrement: 50,
  cleaningRates: Object.freeze({
    regular: 80,
    general: 130,
    "post-renovation": 180,
  }),
  propertyCoefficients: Object.freeze({
    apartment: 1,
    house: 1.1,
    office: 0.95,
  }),
  frequencyCoefficients: Object.freeze({
    "one-time": 1,
    recurring: 0.9,
  }),
  addOnPrices: Object.freeze({
    windows: 1200,
    oven: 600,
    fridge: 500,
  }),
});

export type PropertyType = keyof typeof PRICING.propertyCoefficients;
export type CleaningType = keyof typeof PRICING.cleaningRates;
export type Frequency = keyof typeof PRICING.frequencyCoefficients;
export type AddOn = keyof typeof PRICING.addOnPrices;

export interface PricingInput {
  propertyType: PropertyType;
  cleaningType: CleaningType;
  frequency: Frequency;
  addOns: readonly AddOn[];
  area: number;
}

export type PricingResult =
  | { ok: true; price: number }
  | { ok: false; error: "area-not-finite" | "area-out-of-range" };

/**
 * Returns a discriminated result instead of throwing so a future UI can render
 * validation feedback directly next to the area field.
 */
export function calculatePrice(input: PricingInput): PricingResult {
  if (!Number.isFinite(input.area)) {
    return { ok: false, error: "area-not-finite" };
  }

  if (input.area < PRICING.area.minimum || input.area > PRICING.area.maximum) {
    return { ok: false, error: "area-out-of-range" };
  }

  const basePrice =
    input.area *
    PRICING.cleaningRates[input.cleaningType] *
    PRICING.propertyCoefficients[input.propertyType] *
    PRICING.frequencyCoefficients[input.frequency];
  const addOnsPrice = input.addOns.reduce(
    (total, addOn) => total + PRICING.addOnPrices[addOn],
    0,
  );
  const priceBeforeRounding = Math.max(
    PRICING.minimumOrder,
    basePrice + addOnsPrice,
  );

  return {
    ok: true,
    price:
      Math.round(priceBeforeRounding / PRICING.roundingIncrement) *
      PRICING.roundingIncrement,
  };
}