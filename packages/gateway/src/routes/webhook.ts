import { Hono } from "hono";
import { getConfig } from "../config";
import { createWebhookVerifier } from "../middleware/verify";
import { createDedup } from "../middleware/dedup";
import { triggerWorkflow } from "../services/workflow";

export function createWebhookRoutes(): Hono {
  const config = getConfig();
  const webhookRoutes = new Hono();

  // Plane: Issue Approved → trigger doc generation
  webhookRoutes.post(
    "/plane",
    createWebhookVerifier("X-Plane-Secret", config.planeWebhookSecret),
    createDedup("X-Plane-Event-Id", "plane"),
    async (c) => {
      const body = await c.req.json();

      // Parse Plane webhook payload
      const event = body.event;
      const issueId = body.data?.id;
      const status = body.data?.state?.name;
      const projectId = body.data?.project;
      const prdPath = body.data?.description_html; // extract PRD path from description

      if (event === "issue" && status === "Approved" && issueId) {
        triggerWorkflow({
          workflow_type: "prd_to_tech",
          trigger_source: "plane_webhook",
          plane_issue_id: issueId,
          input_path: prdPath,
          project_id: projectId,
        });
      }

      return c.json({ received: true, source: "plane" });
    },
  );

  // Git: MR merged / docs push
  webhookRoutes.post(
    "/git",
    createWebhookVerifier("X-Gitea-Secret", config.gitWebhookSecret),
    createDedup("X-Gitea-Delivery", "git"),
    async (c) => {
      await c.req.json();
      // Git webhooks are handled by CI/CD pipeline and Plane
      // This endpoint primarily logs the event for auditing
      return c.json({ received: true, source: "git" });
    },
  );

  // CI/CD: Test Failed → Bug analysis
  webhookRoutes.post(
    "/cicd",
    createWebhookVerifier("X-CI-Secret", config.cicdWebhookSecret),
    createDedup("X-CI-Event-Id", "cicd"),
    async (c) => {
      const body = await c.req.json();

      const status = body.status ?? body.state;
      const logs = body.logs ?? body.output ?? "";
      const issueId = body.issue_id ?? body.plane_issue_id;
      const projectId = body.project_id;
      const repo = body.repository ?? body.repo;

      if (status === "failed" || status === "failure") {
        triggerWorkflow({
          workflow_type: "bug_analysis",
          trigger_source: "cicd_webhook",
          plane_issue_id: issueId,
          input_path: logs,
          project_id: projectId,
          target_repos: repo ? [repo] : undefined,
        });
      }

      return c.json({ received: true, source: "cicd" });
    },
  );

  // Feishu callback: approval button clicks
  webhookRoutes.post("/feishu", async (c) => {
    const body = await c.req.json();

    // Parse Feishu card action callback
    const action = body.action;
    if (action?.value) {
      try {
        const value = JSON.parse(action.value);
        const actionType = value.action; // "approve" or "reject"
        const issueId = value.issue_id;

        if (actionType === "approve" && issueId) {
          // Trigger code generation
          triggerWorkflow({
            workflow_type: "code_gen",
            trigger_source: "manual",
            plane_issue_id: issueId,
            input_path: value.doc_path,
            target_repos: ["backend"],
          });
        }
        // reject is handled by updateIssueState in the workflow
      } catch {
        // Invalid action value, ignore
      }
    }

    return c.json({ received: true, source: "feishu" });
  });

  return webhookRoutes;
}
