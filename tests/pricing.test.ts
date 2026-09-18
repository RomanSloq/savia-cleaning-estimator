import { describe, expect, it } from "vitest";
import { calculatePrice, type PricingInput } from "../src/lib/pricing";

const baseInput: PricingInput = {
  propertyType: "apartment",
  cleaningType: "regular",
  frequency: "one-time",
  addOns: [],
  area: 50,
};

function expectPrice(input: PricingInput, price: number): void {
  expect(calculatePrice(input)).toEqual({ ok: true, price });
}

describe("calculatePrice", () => {
  it("calculates the documented general-cleaning example", () => {
    expectPrice(
      {
        propertyType: "apartment",
        cleaningType: "general",
        frequency: "one-time",
        addOns: ["windows"],
        area: 60,
      },
      9000,
    );
  });

  it("calculates regular cleaning", () => {
    expectPrice(baseInput, 4000);
  });

  it("calculates post-renovation cleaning", () => {
    expectPrice({ ...baseInput, cleaningType: "post-renovation", area: 30 }, 5400);
  });

  it("applies the house coefficient", () => {
    expectPrice({ ...baseInput, propertyType: "house" }, 4400);
  });

  it("applies the office coefficient", () => {
    expectPrice({ ...baseInput, propertyType: "office" }, 3800);
  });

  it("applies the recurring frequency discount", () => {
    expectPrice({ ...baseInput, frequency: "recurring" }, 3600);
  });

  it.each([
    ["windows", 5200],
    ["oven", 4600],
    ["fridge", 4500],
  ] as const)("adds %s", (addOn, price) => {
    expectPrice({ ...baseInput, addOns: [addOn] }, price);
  });

  it("adds multiple add-ons", () => {
    expectPrice({ ...baseInput, addOns: ["windows", "oven", "fridge"] }, 6300);
  });

  it("applies the minimum order", () => {
    expectPrice({ ...baseInput, propertyType: "office", area: 20 }, 3000);
  });

  it("rounds the final price to the nearest 50 RUB", () => {
    expectPrice({ ...baseInput, cleaningType: "general", area: 29 }, 3750);
  });

  it.each([
    [20, { ok: true, price: 3000 }],
    [500, { ok: true, price: 40000 }],
    [19, { ok: false, error: "area-out-of-range" }],
    [501, { ok: false, error: "area-out-of-range" }],
    [0, { ok: false, error: "area-out-of-range" }],
    [-1, { ok: false, error: "area-out-of-range" }],
    [Number.NaN, { ok: false, error: "area-not-finite" }],
    [Number.POSITIVE_INFINITY, { ok: false, error: "area-not-finite" }],
  ] as const)("handles area %s", (area, expected) => {
    expect(calculatePrice({ ...baseInput, area })).toEqual(expected);
  });

  it("is deterministic and does not mutate its input", () => {
    const input: PricingInput = {
      ...baseInput,
      addOns: ["windows", "oven"],
    };
    const originalAddOns = [...input.addOns];

    expect(calculatePrice(input)).toEqual(calculatePrice(input));
    expect(input.addOns).toEqual(originalAddOns);
  });
});