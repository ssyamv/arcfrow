import { writeFileSync } from "fs";
import { join } from "path";
import { getConfig } from "../config";

interface ClaudeCodeResult {
  success: boolean;
  output: string;
  error?: string;
}

export async function runClaudeCode(
  cwd: string,
  taskDescription: string,
  options?: {
    figmaUrl?: string;
  },
): Promise<ClaudeCodeResult> {
  const config = getConfig();

  const args = ["-p", taskDescription, "--output-format", "json", "--dangerously-skip-permissions"];

  // If Figma URL provided, generate .mcp.json for Figma MCP Server
  if (options?.figmaUrl) {
    const mcpConfig = {
      mcpServers: {
        figma: {
          command: "npx",
          args: ["-y", "@anthropic-ai/figma-mcp"],
          env: {
            FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN ?? "",
          },
        },
      },
    };
    writeFileSync(join(cwd, ".mcp.json"), JSON.stringify(mcpConfig, null, 2));
    args.push("--mcp-config", join(cwd, ".mcp.json"));
  }

  return new Promise<ClaudeCodeResult>((resolve) => {
    const proc = Bun.spawn(["claude", ...args], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
    });

    const timeout = setTimeout(() => {
      proc.kill();
      resolve({
        success: false,
        output: "",
        error: `Claude Code timed out after ${config.claudeCodeTimeout}ms`,
      });
    }, config.claudeCodeTimeout);

    proc.exited.then(async (code) => {
      clearTimeout(timeout);

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      if (code === 0) {
        resolve({ success: true, output: stdout });
      } else {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Claude Code exited with code ${code}`,
        });
      }
    });
  });
}
