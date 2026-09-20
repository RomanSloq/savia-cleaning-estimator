import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { handleLeadPost, methodNotAllowed } from "../../lib/server/lead-endpoint";
import { deliverTelegramLead } from "../../lib/server/telegram";

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleLeadPost(request, async (lead) => {
  const botToken = getSecret("TELEGRAM_BOT_TOKEN")?.trim();
  const chatId = getSecret("TELEGRAM_CHAT_ID")?.trim();
  if (!botToken || !chatId) return "unconfigured";

  return await deliverTelegramLead(lead, { botToken, chatId }) ? "delivered" : "failed";
});

export const ALL: APIRoute = () => methodNotAllowed();
