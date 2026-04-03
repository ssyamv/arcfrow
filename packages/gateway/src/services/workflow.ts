import { createWorkflowExecution, updateWorkflowStatus } from "../db/queries";
import type { WorkflowType, TriggerSource } from "../types";

interface TriggerParams {
  workflow_type: WorkflowType;
  trigger_source: TriggerSource;
  plane_issue_id?: string;
  input_path?: string;
  target_repos?: string[];
}

export async function triggerWorkflow(params: TriggerParams): Promise<number> {
  const executionId = createWorkflowExecution({
    workflow_type: params.workflow_type,
    trigger_source: params.trigger_source,
    plane_issue_id: params.plane_issue_id,
    input_path: params.input_path,
  });

  updateWorkflowStatus(executionId, "running");

  // TODO: 根据 workflow_type 分发到对应的处理函数
  // - prd_to_tech: Git pull PRD → Dify 工作流一 → Git push 技术文档 → Dify 工作流二 → Git push OpenAPI
  // - tech_to_openapi: Dify 工作流二
  // - bug_analysis: Dify 工作流三 → 创建 Bug Issue
  // - code_gen: Claude Code headless 代码生成

  return executionId;
}
