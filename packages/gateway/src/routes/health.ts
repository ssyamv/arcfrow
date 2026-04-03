import { Hono } from "hono";

export const healthRoutes = new Hono();

healthRoutes.get("/health", (c) => c.json({ status: "ok" }));
healthRoutes.get("/version", (c) => c.json({ version: "0.0.1" }));
