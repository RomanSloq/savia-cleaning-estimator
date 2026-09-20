import { describe, expect, it } from "vitest";
import { validateLeadRequest } from "../src/lib/server/lead-validation";

const estimate = {
  propertyType: "apartment",
  cleaningType: "general",
  area: 60,
  frequency: "one-time",
  addOns: ["windows"],
  price: 1,
};

describe("validateLeadRequest", () => {
  it("accepts and trims a basic lead", () => {
    expect(validateLeadRequest({ name: " Анна ", contact: " @anna ", website: "" }))
      .toEqual({ ok: true, lead: { name: "Анна", contact: "@anna" } });
  });

  it("accepts an optional estimate and replaces its price with the server result", () => {
    expect(validateLeadRequest({ name: "Анна", contact: "@anna", estimate })).toEqual({
      ok: true,
      lead: {
        name: "Анна",
        contact: "@anna",
        estimate: { ...estimate, price: 9000 },
      },
    });
  });

  it.each([
    [{ contact: "@anna" }, "missing name"],
    [{ name: "Анна" }, "missing contact"],
    [{ name: "Анна", contact: "@anna", estimate: { ...estimate, cleaningType: "deep" } }, "unknown enum"],
    [{ name: "Анна", contact: "@anna", estimate: { ...estimate, area: 10 } }, "invalid area"],
    [{ name: "x".repeat(101), contact: "@anna" }, "excessive name"],
    [{ name: "Анна", contact: "@anna", website: "https://spam.example" }, "filled honeypot"],
  ])("rejects %s (%s)", (input, _reason) => {
    expect(validateLeadRequest(input)).toEqual({ ok: false });
  });
});
