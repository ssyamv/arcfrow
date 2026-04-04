import { describe, expect, it } from "bun:test";
import { getConfig } from "./config";

describe("config", () => {
  it("returns default values when env vars are not set", () => {
    const config = getConfig();
    expect(config.port).toBe(3100);
    expect(config.claudeCodeTimeout).toBe(600000);
  });

  it("reads PORT from env", () => {
    const original = process.env.PORT;
    process.env.PORT = "8080";
    const config = getConfig();
    expect(config.port).toBe(8080);
    process.env.PORT = original;
  });

  it("uses specific Dify API keys when set", () => {
    const origBase = process.env.DIFY_API_KEY;
    const origTech = process.env.DIFY_TECH_DOC_API_KEY;
    const origOpenApi = process.env.DIFY_OPENAPI_API_KEY;
    const origBug = process.env.DIFY_BUG_ANALYSIS_API_KEY;

    process.env.DIFY_API_KEY = "shared-key";
    process.env.DIFY_TECH_DOC_API_KEY = "tech-doc-key";
    process.env.DIFY_OPENAPI_API_KEY = "openapi-key";
    process.env.DIFY_BUG_ANALYSIS_API_KEY = "bug-key";

    const config = getConfig();
    expect(config.difyTechDocApiKey).toBe("tech-doc-key");
    expect(config.difyOpenApiApiKey).toBe("openapi-key");
    expect(config.difyBugAnalysisApiKey).toBe("bug-key");

    process.env.DIFY_API_KEY = origBase;
    process.env.DIFY_TECH_DOC_API_KEY = origTech;
    process.env.DIFY_OPENAPI_API_KEY = origOpenApi;
    process.env.DIFY_BUG_ANALYSIS_API_KEY = origBug;
  });

  it("falls back to DIFY_API_KEY when specific keys are not set", () => {
    const origBase = process.env.DIFY_API_KEY;
    const origTech = process.env.DIFY_TECH_DOC_API_KEY;
    const origOpenApi = process.env.DIFY_OPENAPI_API_KEY;
    const origBug = process.env.DIFY_BUG_ANALYSIS_API_KEY;

    delete process.env.DIFY_TECH_DOC_API_KEY;
    delete process.env.DIFY_OPENAPI_API_KEY;
    delete process.env.DIFY_BUG_ANALYSIS_API_KEY;
    process.env.DIFY_API_KEY = "fallback-key";

    const config = getConfig();
    expect(config.difyTechDocApiKey).toBe("fallback-key");
    expect(config.difyOpenApiApiKey).toBe("fallback-key");
    expect(config.difyBugAnalysisApiKey).toBe("fallback-key");

    process.env.DIFY_API_KEY = origBase;
    process.env.DIFY_TECH_DOC_API_KEY = origTech;
    process.env.DIFY_OPENAPI_API_KEY = origOpenApi;
    process.env.DIFY_BUG_ANALYSIS_API_KEY = origBug;
  });
});
