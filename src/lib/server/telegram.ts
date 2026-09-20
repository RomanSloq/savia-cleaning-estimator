import type { VerifiedLead } from "./lead-validation";
import type { AddOn, CleaningType, Frequency, PropertyType } from "../pricing";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

type Fetcher = typeof fetch;

const propertyLabels: Record<PropertyType, string> = {
  apartment: "Квартира",
  house: "Дом",
  office: "Офис",
};

const cleaningLabels: Record<CleaningType, string> = {
  regular: "Стандартная",
  general: "Генеральная",
  "post-renovation": "После ремонта",
};

const frequencyLabels: Record<Frequency, string> = {
  "one-time": "Разово",
  recurring: "Регулярно",
};

const addOnLabels: Record<AddOn, string> = {
  windows: "Мойка окон",
  oven: "Чистка духовки",
  fridge: "Чистка холодильника",
};

export function formatTelegramMessage(lead: VerifiedLead): string {
  const lines = [
    "Новая заявка Savia",
    "",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
  ];

  if (lead.comment) lines.push(`Комментарий: ${lead.comment}`);
  lines.push("");

  if (!lead.estimate) {
    lines.push("Расчёт: не выполнялся");
    return lines.join("\n");
  }

  const { estimate } = lead;
  const addOns = estimate.addOns.length
    ? estimate.addOns.map((addOn) => addOnLabels[addOn]).join(", ")
    : "Нет";

  lines.push(
    "Расчёт:",
    `Объект: ${propertyLabels[estimate.propertyType]}`,
    `Тип уборки: ${cleaningLabels[estimate.cleaningType]}`,
    `Площадь: ${estimate.area} м²`,
    `Частота: ${frequencyLabels[estimate.frequency]}`,
    `Доп. услуги: ${addOns}`,
    `Предварительная стоимость: ${new Intl.NumberFormat("ru-RU").format(estimate.price)} ₽`,
  );

  return lines.join("\n");
}

export async function deliverTelegramLead(
  lead: VerifiedLead,
  config: TelegramConfig,
  fetcher: Fetcher = fetch,
): Promise<boolean> {
  try {
    const response = await fetcher(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: formatTelegramMessage(lead),
        }),
      },
    );

    if (!response.ok) return false;
    const result: unknown = await response.json();
    return typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch {
    return false;
  }
}
