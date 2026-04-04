import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { generateTechDoc, generateOpenApi, analyzeBug } from "./dify";

function makeDifyResponse(output: string) {
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
    json: () =>
      Promise.resolve({
        data: {
          id: "run-1",
          workflow_id: "wf-1",
          status: "succeeded",
          outputs: { result: output },
        },
      }),
  };
}

function mockFetch(onCall: (auth: string) => void, output: string) {
  const fn = async (_url: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>;
    onCall(headers["Authorization"]);
    return makeDifyResponse(output);
  };
  globalThis.fetch = fn as unknown as typeof fetch;
}

describe("dify service", () => {
  let originalFetch: typeof globalThis.fetch;
  let envBackup: Record<string, string | undefined>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    envBackup = {
      DIFY_BASE_URL: process.env.DIFY_BASE_URL,
      DIFY_API_KEY: process.env.DIFY_API_KEY,
      DIFY_TECH_DOC_API_KEY: process.env.DIFY_TECH_DOC_API_KEY,
      DIFY_OPENAPI_API_KEY: process.env.DIFY_OPENAPI_API_KEY,
      DIFY_BUG_ANALYSIS_API_KEY: process.env.DIFY_BUG_ANALYSIS_API_KEY,
    };

    process.env.DIFY_BASE_URL = "http://dify-test:3001";
    process.env.DIFY_API_KEY = "shared-key";
    process.env.DIFY_TECH_DOC_API_KEY = "tech-doc-key";
    process.env.DIFY_OPENAPI_API_KEY = "openapi-key";
    process.env.DIFY_BUG_ANALYSIS_API_KEY = "bug-analysis-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(envBackup)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("generateTechDoc uses difyTechDocApiKey", async () => {
    let capturedAuth = "";
    mockFetch((auth) => {
      capturedAuth = auth;
    }, "tech doc output");

    const result = await generateTechDoc("some prd");
    expect(capturedAuth).toBe("Bearer tech-doc-key");
    expect(result).toBe("tech doc output");
  });

  it("generateOpenApi uses difyOpenApiApiKey", async () => {
    let capturedAuth = "";
    mockFetch((auth) => {
      capturedAuth = auth;
    }, "openapi output");

    const result = await generateOpenApi("some tech doc");
    expect(capturedAuth).toBe("Bearer openapi-key");
    expect(result).toBe("openapi output");
  });

  it("analyzeBug uses difyBugAnalysisApiKey", async () => {
    let capturedAuth = "";
    mockFetch((auth) => {
      capturedAuth = auth;
    }, "bug analysis output");

    const result = await analyzeBug("ci log", "context");
    expect(capturedAuth).toBe("Bearer bug-analysis-key");
    expect(result).toBe("bug analysis output");
  });

  it("falls back to shared DIFY_API_KEY when specific keys are not set", async () => {
    delete process.env.DIFY_TECH_DOC_API_KEY;
    delete process.env.DIFY_OPENAPI_API_KEY;
    delete process.env.DIFY_BUG_ANALYSIS_API_KEY;

    let capturedAuth = "";
    mockFetch((auth) => {
      capturedAuth = auth;
    }, "output");

    await generateTechDoc("prd");
    expect(capturedAuth).toBe("Bearer shared-key");

    await generateOpenApi("tech doc");
    expect(capturedAuth).toBe("Bearer shared-key");

    await analyzeBug("log", "ctx");
    expect(capturedAuth).toBe("Bearer shared-key");
  });
});
