import { describe, expect, it } from "vitest";
import { createLeadPayload, type LeadEstimate } from "../src/lib/lead";

const estimate: LeadEstimate = {
  propertyType: "apartment",
  cleaningType: "general",
  area: 60,
  frequency: "one-time",
  addOns: ["windows"],
  price: 9_000,
};

describe("createLeadPayload", () => {
  it("returns a transport-agnostic lead with an estimate when one exists", () => {
    expect(createLeadPayload({
      name: " Анна ",
      contact: " @anna ",
      comment: " Нужна уборка утром ",
      estimate,
    })).toEqual({
      name: "Анна",
      contact: "@anna",
      comment: "Нужна уборка утром",
      estimate,
    });
  });

  it("keeps estimate and comment optional for a normal form request", () => {
    expect(createLeadPayload({
      name: "Илья",
      contact: "+7 900 000-00-00",
      comment: "   ",
    })).toEqual({
      name: "Илья",
      contact: "+7 900 000-00-00",
    });
  });
});