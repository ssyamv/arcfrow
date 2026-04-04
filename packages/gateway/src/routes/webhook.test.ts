import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { createWebhookRoutes } from "./webhook";
import { closeDb, getDb } from "../db";
import * as workflowService from "../services/workflow";

describe("webhook routes", () => {
  let app: Hono;
  let triggerSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    getDb();
    app = new Hono();
    app.route("/webhook", createWebhookRoutes());
    triggerSpy = spyOn(workflowService, "triggerWorkflow").mockResolvedValue(1);
  });

  afterEach(() => {
    closeDb();
    mock.restore();
  });

  it("POST /webhook/plane returns received", async () => {
    const res = await app.request("/webhook/plane", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "issue_update" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("plane");
  });

  it("POST /webhook/plane triggers prd_to_tech when issue is Approved", async () => {
    const res = await app.request("/webhook/plane", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "issue",
        data: {
          id: "issue-42",
          state: { name: "Approved" },
          project: "proj-1",
          description_html: "prd/2026-04/login.md",
        },
      }),
    });
    expect(res.status).toBe(200);
    expect(triggerSpy).toHaveBeenCalledWith({
      workflow_type: "prd_to_tech",
      trigger_source: "plane_webhook",
      plane_issue_id: "issue-42",
      input_path: "prd/2026-04/login.md",
      project_id: "proj-1",
    });
  });

  it("POST /webhook/plane does not trigger workflow for non-Approved status", async () => {
    await app.request("/webhook/plane", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "issue",
        data: {
          id: "issue-43",
          state: { name: "In Progress" },
          project: "proj-1",
        },
      }),
    });
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("POST /webhook/git returns received", async () => {
    const res = await app.request("/webhook/git", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "refs/heads/main" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("git");
  });

  it("POST /webhook/cicd returns received", async () => {
    const res = await app.request("/webhook/cicd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "success" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("cicd");
  });

  it("POST /webhook/cicd triggers bug_analysis on failure", async () => {
    const res = await app.request("/webhook/cicd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "failed",
        logs: "Error: test assertion failed at line 42",
        issue_id: "ISS-99",
        project_id: "proj-2",
        repository: "backend",
      }),
    });
    expect(res.status).toBe(200);
    expect(triggerSpy).toHaveBeenCalledWith({
      workflow_type: "bug_analysis",
      trigger_source: "cicd_webhook",
      plane_issue_id: "ISS-99",
      input_path: "Error: test assertion failed at line 42",
      project_id: "proj-2",
      target_repos: ["backend"],
    });
  });

  it("POST /webhook/cicd does not trigger on success status", async () => {
    await app.request("/webhook/cicd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "success" }),
    });
    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("POST /webhook/feishu returns received", async () => {
    const res = await app.request("/webhook/feishu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("feishu");
  });

  it("POST /webhook/feishu triggers code_gen on approve action", async () => {
    const actionValue = JSON.stringify({
      action: "approve",
      issue_id: "ISS-50",
      doc_path: "tech-design/2026-04/login.md",
    });

    await app.request("/webhook/feishu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: { value: actionValue },
      }),
    });

    expect(triggerSpy).toHaveBeenCalledWith({
      workflow_type: "code_gen",
      trigger_source: "manual",
      plane_issue_id: "ISS-50",
      input_path: "tech-design/2026-04/login.md",
      target_repos: ["backend"],
    });
  });

  it("POST /webhook/feishu does not trigger on reject action", async () => {
    const actionValue = JSON.stringify({
      action: "reject",
      issue_id: "ISS-51",
    });

    await app.request("/webhook/feishu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: { value: actionValue },
      }),
    });

    expect(triggerSpy).not.toHaveBeenCalled();
  });

  it("POST /webhook/feishu handles invalid action value gracefully", async () => {
    const res = await app.request("/webhook/feishu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: { value: "not-json{{{" },
      }),
    });
    expect(res.status).toBe(200);
    expect(triggerSpy).not.toHaveBeenCalled();
  });
});
