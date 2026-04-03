import { Hono } from "hono";
import { getConfig } from "../config";
import { createWebhookVerifier } from "../middleware/verify";
import { createDedup } from "../middleware/dedup";

export function createWebhookRoutes(): Hono {
  const config = getConfig();
  const webhookRoutes = new Hono();

  // Plane: Issue Approved → 触发文档生成
  webhookRoutes.post(
    "/plane",
    createWebhookVerifier("X-Plane-Secret", config.planeWebhookSecret),
    createDedup("X-Plane-Event-Id", "plane"),
    async (c) => {
      await c.req.json();
      // TODO: workflow service integration
      return c.json({ received: true, source: "plane" });
    },
  );

  // Git: MR Created / docs push
  webhookRoutes.post(
    "/git",
    createWebhookVerifier("X-Gitea-Secret", config.gitWebhookSecret),
    createDedup("X-Gitea-Delivery", "git"),
    async (c) => {
      await c.req.json();
      // TODO: workflow service integration
      return c.json({ received: true, source: "git" });
    },
  );

  // CI/CD: Test Failed → Bug analysis
  webhookRoutes.post(
    "/cicd",
    createWebhookVerifier("X-CI-Secret", config.cicdWebhookSecret),
    createDedup("X-CI-Event-Id", "cicd"),
    async (c) => {
      await c.req.json();
      // TODO: workflow service integration
      return c.json({ received: true, source: "cicd" });
    },
  );

  // Feishu callback: approval buttons
  webhookRoutes.post("/feishu", async (c) => {
    await c.req.json();
    // TODO: Feishu HMAC-SHA256 verification + workflow integration
    return c.json({ received: true, source: "feishu" });
  });

  return webhookRoutes;
}
