import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { createWebhookVerifier } from "./verify";

describe("webhook verify middleware", () => {
  it("returns 401 when secret header is missing", async () => {
    const app = new Hono();
    app.use("/*", createWebhookVerifier("X-Webhook-Secret", "my-secret"));
    app.post("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret header is wrong", async () => {
    const app = new Hono();
    app.use("/*", createWebhookVerifier("X-Webhook-Secret", "my-secret"));
    app.post("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {
      method: "POST",
      headers: { "X-Webhook-Secret": "wrong-secret" },
    });
    expect(res.status).toBe(401);
  });

  it("passes when secret matches", async () => {
    const app = new Hono();
    app.use("/*", createWebhookVerifier("X-Webhook-Secret", "my-secret"));
    app.post("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {
      method: "POST",
      headers: { "X-Webhook-Secret": "my-secret" },
    });
    expect(res.status).toBe(200);
  });

  it("skips verification when secret is not configured", async () => {
    const app = new Hono();
    app.use("/*", createWebhookVerifier("X-Webhook-Secret", ""));
    app.post("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", { method: "POST" });
    expect(res.status).toBe(200);
  });
});
