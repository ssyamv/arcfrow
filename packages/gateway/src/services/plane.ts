import { getConfig } from "../config";

interface PlaneIssue {
  id: string;
  name: string;
  description_html: string;
  state: string;
  priority: string;
  labels: string[];
}

async function planeRequest(
  path: string,
  options: RequestInit = {},
  retries = 2,
): Promise<unknown> {
  const config = getConfig();
  const url = `${config.planeBaseUrl}/api/v1/workspaces/${config.planeWorkspaceSlug}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.planeApiToken,
          ...options.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`Plane API error: ${res.status} ${await res.text()}`);
      }

      return await res.json();
    } catch (error) {
      if (attempt < retries) {
        const delay = attempt === 0 ? 5000 : 15000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Plane API call failed after all retries");
}

export async function getIssue(projectId: string, issueId: string): Promise<PlaneIssue> {
  return planeRequest(`/projects/${projectId}/issues/${issueId}/`) as Promise<PlaneIssue>;
}

export async function updateIssueState(
  projectId: string,
  issueId: string,
  stateId: string,
): Promise<void> {
  await planeRequest(`/projects/${projectId}/issues/${issueId}/`, {
    method: "PATCH",
    body: JSON.stringify({ state: stateId }),
  });
}

export async function createBugIssue(
  projectId: string,
  params: {
    name: string;
    description_html: string;
    priority: string;
    parent_issue_id?: string;
  },
): Promise<PlaneIssue> {
  return planeRequest(`/projects/${projectId}/issues/`, {
    method: "POST",
    body: JSON.stringify(params),
  }) as Promise<PlaneIssue>;
}
