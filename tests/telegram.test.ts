import { describe, expect, it, vi } from "vitest";
import { deliverTelegramLead, formatTelegramMessage } from "../src/lib/server/telegram";
import type { VerifiedLead } from "../src/lib/server/lead-validation";

const basicLead: VerifiedLead = {
  name: "Тестовый клиент",
  contact: "@sample",
};

const leadWithEstimate: VerifiedLead = {
  ...basicLead,
  comment: "Утром",
  estimate: {
    propertyType: "apartment",
    cleaningType: "general",
    area: 60,
    frequency: "one-time",
    addOns: ["windows"],
    price: 9000,
  },
};

const config = { botToken: "test-token", chatId: "test-chat" };

describe("formatTelegramMessage", () => {
  it("formats a verified estimate with readable Russian labels", () => {
    const message = formatTelegramMessage(leadWithEstimate);
    expect(message).toContain("Объект: Квартира");
    expect(message).toContain("Тип уборки: Генеральная");
    expect(message).toContain("Частота: Разово");
    expect(message).toContain("Доп. услуги: Мойка окон");
    expect(message).toContain("Предварительная стоимость: 9 000 ₽");
    expect(message).not.toContain("one-time");
  });

  it("formats a lead without an estimate or optional comment", () => {
    const message = formatTelegramMessage(basicLead);
    expect(message).toContain("Расчёт: не выполнялся");
    expect(message).not.toContain("Комментарий:");
  });
});

describe("deliverTelegramLead", () => {
  it("returns true for a successful Telegram response", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    await expect(deliverTelegramLead(basicLead, config, fetcher)).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it.each([
    [new Response('{"ok":false}', { status: 500 }), "HTTP failure"],
    [new Response('{"ok":false}', { status: 200 }), "Telegram rejection"],
  ])("returns false for %s (%s)", async (response) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    await expect(deliverTelegramLead(basicLead, config, fetcher)).resolves.toBe(false);
  });

  it("returns false for a network failure", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    await expect(deliverTelegramLead(basicLead, config, fetcher)).resolves.toBe(false);
  });
});
