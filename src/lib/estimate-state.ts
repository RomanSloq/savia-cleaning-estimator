import type { LeadEstimate } from "./lead";

export const estimateChangeEvent = "savia:estimate-change";

declare global {
  interface Window {
    saviaEstimate?: LeadEstimate;
  }
}

export function setCurrentEstimate(estimate: LeadEstimate | undefined): void {
  if (typeof window === "undefined") return;

  window.saviaEstimate = estimate;
  document.dispatchEvent(
    new CustomEvent<LeadEstimate | undefined>(estimateChangeEvent, { detail: estimate }),
  );
}

export function getCurrentEstimate(): LeadEstimate | undefined {
  return typeof window === "undefined" ? undefined : window.saviaEstimate;
}