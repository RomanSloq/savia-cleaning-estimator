import { describe, expect, it, vi } from "vitest";
import { handleLeadPost, methodNotAllowed } from "../src/lib/server/lead-endpoint";

function request(body: string, contentType = "application/json"): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });
}

describe("handleLeadPost", () => {
  it("returns success only after delivery succeeds", async () => {
    const deliver = vi.fn().mockResolvedValue("delivered");
    const response = await handleLeadPost(
      request(JSON.stringify({ name: "Анна", contact: "@anna" })),
      deliver,
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledOnce();
  });

  it.each([
    ["unconfigured", 503, "delivery_unconfigured"],
    ["failed", 502, "delivery_failed"],
  ] as const)("maps %s delivery to HTTP %s", async (result, status, error) => {
    const response = await handleLeadPost(
      request(JSON.stringify({ name: "Анна", contact: "@anna" })),
      vi.fn().mockResolvedValue(result),
    );
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ ok: false, error });
  });

  it.each([
    ["{", "application/json"],
    [JSON.stringify({ name: "Анна" }), "application/json"],
    [JSON.stringify({ name: "Анна", contact: "@anna" }), "text/plain"],
  ])("rejects malformed or invalid input", async (body, contentType) => {
    const deliver = vi.fn();
    const response = await handleLeadPost(request(body, contentType), deliver);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "invalid_input" });
    expect(deliver).not.toHaveBeenCalled();
  });

  it("returns a controlled failure when delivery throws", async () => {
    const response = await handleLeadPost(
      request(JSON.stringify({ name: "Анна", contact: "@anna" })),
      vi.fn().mockRejectedValue(new Error("internal")),
    );
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "delivery_failed" });
  });
});

describe("methodNotAllowed", () => {
  it("allows POST only", () => {
    const response = methodNotAllowed();
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });
});
