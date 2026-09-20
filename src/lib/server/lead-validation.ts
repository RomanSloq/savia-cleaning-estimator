import type { LeadPayload } from "../lead";
import {
  calculatePrice,
  PRICING,
  type AddOn,
  type CleaningType,
  type Frequency,
  type PropertyType,
} from "../pricing";

export const LEAD_LIMITS = Object.freeze({
  name: 100,
  contact: 160,
  comment: 1000,
});

export interface VerifiedLead extends Omit<LeadPayload, "estimate"> {
  estimate?: NonNullable<LeadPayload["estimate"]>;
}

export type LeadValidationResult =
  | { ok: true; lead: VerifiedLead }
  | { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKnownKey<T extends object>(value: unknown, values: T): value is Extract<keyof T, string> {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(values, value);
}

function readRequiredString(value: unknown, maximum: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maximum ? trimmed : undefined;
}

function readOptionalString(value: unknown, maximum: number): string | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maximum ? trimmed || undefined : null;
}

function isAddOn(value: unknown): value is AddOn {
  return isKnownKey(value, PRICING.addOnPrices);
}

export function validateLeadRequest(input: unknown): LeadValidationResult {
  if (!isRecord(input)) return { ok: false };

  const honeypot = input.website;
  if (honeypot !== undefined && (typeof honeypot !== "string" || honeypot.trim())) {
    return { ok: false };
  }

  const name = readRequiredString(input.name, LEAD_LIMITS.name);
  const contact = readRequiredString(input.contact, LEAD_LIMITS.contact);
  const comment = readOptionalString(input.comment, LEAD_LIMITS.comment);
  if (!name || !contact || comment === null) return { ok: false };

  const baseLead = {
    name,
    contact,
    ...(comment ? { comment } : {}),
  };

  if (input.estimate === undefined) return { ok: true, lead: baseLead };
  if (!isRecord(input.estimate)) return { ok: false };

  const estimate = input.estimate;
  if (
    !isKnownKey(estimate.propertyType, PRICING.propertyCoefficients) ||
    !isKnownKey(estimate.cleaningType, PRICING.cleaningRates) ||
    !isKnownKey(estimate.frequency, PRICING.frequencyCoefficients) ||
    !Array.isArray(estimate.addOns) ||
    !estimate.addOns.every(isAddOn) ||
    new Set(estimate.addOns).size !== estimate.addOns.length ||
    typeof estimate.area !== "number" ||
    !Number.isFinite(estimate.area) ||
    typeof estimate.price !== "number" ||
    !Number.isFinite(estimate.price) ||
    estimate.price < 0
  ) {
    return { ok: false };
  }

  const propertyType: PropertyType = estimate.propertyType;
  const cleaningType: CleaningType = estimate.cleaningType;
  const frequency: Frequency = estimate.frequency;
  const addOns: AddOn[] = estimate.addOns;
  const result = calculatePrice({
    propertyType,
    cleaningType,
    frequency,
    addOns,
    area: estimate.area,
  });

  if (!result.ok) return { ok: false };

  return {
    ok: true,
    lead: {
      ...baseLead,
      estimate: {
        propertyType,
        cleaningType,
        frequency,
        addOns,
        area: estimate.area,
        price: result.price,
      },
    },
  };
}
