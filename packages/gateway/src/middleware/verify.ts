import type { MiddlewareHandler } from "hono";

export function createWebhookVerifier(
  headerName: string,
  expectedSecret: string,
): MiddlewareHandler {
  return async (c, next) => {
    if (!expectedSecret) {
      await next();
      return;
    }

    const provided = c.req.header(headerName);
    if (!provided || provided !== expectedSecret) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  };
}
