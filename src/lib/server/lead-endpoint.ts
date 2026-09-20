import { validateLeadRequest, type VerifiedLead } from "./lead-validation";

export const MAX_LEAD_BODY_BYTES = 16 * 1024;

export type LeadDeliveryResult = "delivered" | "unconfigured" | "failed";
export type LeadDelivery = (lead: VerifiedLead) => Promise<LeadDeliveryResult>;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readBoundedBody(request: Request): Promise<string | undefined> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_LEAD_BODY_BYTES) return undefined;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_LEAD_BODY_BYTES) {
      await reader.cancel();
      return undefined;
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

export async function handleLeadPost(request: Request, deliver: LeadDelivery): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return json(400, { ok: false, error: "invalid_input" });
  }

  const body = await readBoundedBody(request);
  if (body === undefined) return json(400, { ok: false, error: "invalid_input" });

  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return json(400, { ok: false, error: "invalid_input" });
  }

  const validation = validateLeadRequest(input);
  if (!validation.ok) return json(400, { ok: false, error: "invalid_input" });

  try {
    const result = await deliver(validation.lead);
    if (result === "delivered") return json(200, { ok: true });
    if (result === "unconfigured") {
      return json(503, { ok: false, error: "delivery_unconfigured" });
    }
    return json(502, { ok: false, error: "delivery_failed" });
  } catch {
    return json(502, { ok: false, error: "delivery_failed" });
  }
}

export function methodNotAllowed(): Response {
  return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
    status: 405,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      allow: "POST",
    },
  });
}
