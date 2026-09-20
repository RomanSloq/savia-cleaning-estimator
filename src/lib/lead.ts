import type { PricingInput } from "./pricing";

export interface LeadEstimate extends PricingInput {
  price: number;
}

export interface LeadPayload {
  name: string;
  contact: string;
  comment?: string;
  estimate?: LeadEstimate;
}

export interface LeadFormValues {
  name: string;
  contact: string;
  comment: string;
  estimate?: LeadEstimate;
}

/**
 * Keeps browser form collection independent from any future delivery transport.
 */
export function createLeadPayload({ name, contact, comment, estimate }: LeadFormValues): LeadPayload {
  const trimmedComment = comment.trim();

  return {
    name: name.trim(),
    contact: contact.trim(),
    ...(trimmedComment ? { comment: trimmedComment } : {}),
    ...(estimate ? { estimate } : {}),
  };
}