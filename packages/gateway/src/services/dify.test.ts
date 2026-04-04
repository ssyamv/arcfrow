import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

// Mock config to avoid env var masking in CI
mock.module("../config", () => ({
  getConfig: () => ({
    difyBaseUrl: "http://dify-test:3001",
    difyApiKey: "dify-shared-val",
    difyTechDocApiKey: "dify-techdoc-val",
    difyOpenApiApiKey: "dify-openapi-val",
    difyBugAnalysisApiKey: "dify-bugfix-val",
  }),
}));

const { generateTechDoc, generateOpenApi, analyzeBug } = await import("./dify");

function makeDifyResponse(output: string) {
  return new Response(
    JSON.stringify({
      data: {
        id: "run-1",
        workflow_id: "wf-1",
        status: "succeeded",
        outputs: { result: output },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;

function skipRetryDelays() {
  // @ts-expect-error - mock setTimeout to execute callback immediately
  globalThis.setTimeout = (fn: () => void) => {
    fn();
    return 0;
  };
}

describe("dify service", () => {
  let capturedHeaders: Record<string, string>;

  beforeEach(() => {
    capturedHeaders = {};
    const fn = async (_url: string, init: RequestInit) => {
      const headers = init.headers as Record<string, string>;
      Object.assign(capturedHeaders, headers);
      return makeDifyResponse("generated content");
    };
    globalThis.fetch = fn as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
  });

  it("generateTechDoc uses difyTechDocApiKey", async () => {
    const result = await generateTechDoc("prd content");
    expect(capturedHeaders["Authorization"]).toBe("Bearer dify-techdoc-val");
    expect(result).toBe("generated content");
  });

  it("generateOpenApi uses difyOpenApiApiKey", async () => {
    const result = await generateOpenApi("tech doc content");
    expect(capturedHeaders["Authorization"]).toBe("Bearer dify-openapi-val");
    expect(result).toBe("generated content");
  });

  it("analyzeBug uses difyBugAnalysisApiKey", async () => {
    const result = await analyzeBug("ci log", "context");
    expect(capturedHeaders["Authorization"]).toBe("Bearer dify-bugfix-val");
    expect(result).toBe("generated content");
  });

  it("throws on HTTP error response", async () => {
    skipRetryDelays();
    globalThis.fetch = (async () =>
      new Response("Internal Server Error", { status: 500 })) as unknown as typeof fetch;

    await expect(generateTechDoc("prd")).rejects.toThrow("Dify API error: 500");
  });

  it("throws when workflow status is not succeeded", async () => {
    skipRetryDelays();
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: {
            id: "run-1",
            workflow_id: "wf-1",
            status: "failed",
            outputs: {},
            error: "model timeout",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as unknown as typeof fetch;

    await expect(generateTechDoc("prd")).rejects.toThrow("Dify workflow failed: model timeout");
  });

  it("retries on failure before throwing", async () => {
    skipRetryDelays();
    let callCount = 0;
    globalThis.fetch = (async () => {
      callCount++;
      throw new Error("network error");
    }) as unknown as typeof fetch;

    await expect(generateTechDoc("prd")).rejects.toThrow("network error");
    expect(callCount).toBe(3); // initial + 2 retries
  });
});
