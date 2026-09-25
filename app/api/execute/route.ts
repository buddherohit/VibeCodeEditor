import { NextRequest, NextResponse } from "next/server";
import { getLanguageConfig } from "@/features/playground/libs/runner-config";

export interface PistonFile {
  name?: string;
  content: string;
  encoding?: string;
}

export interface ExecuteRequestBody {
  language: string;
  version?: string;
  files: PistonFile[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
}

export interface ExecutionResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  compile_output?: string;
  exitCode: number | null;
  signal: string | null;
  executionTime?: number;
  language: string;
  version: string;
  error?: string;
}

const DEFAULT_PISTON_ENDPOINT =
  process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston/execute";
const WANDBOX_ENDPOINT = "https://wandbox.org/api/compile.json";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ExecuteRequestBody = await req.json();
    const { language, version, files, stdin = "", args = [] } = body;

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          stdout: "",
          stderr: "No language specified for execution.",
          exitCode: 1,
          signal: null,
          language: "",
          version: "",
          error: "Language parameter is required",
        } satisfies ExecutionResponse,
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0 || !files[0]?.content) {
      return NextResponse.json(
        {
          success: false,
          stdout: "",
          stderr: "Cannot execute empty file.",
          exitCode: 1,
          signal: null,
          language,
          version: version || "*",
          error: "Files array with at least one file content is required",
        } satisfies ExecutionResponse,
        { status: 400 }
      );
    }

    // Resolve language mapping
    const langConfig = getLanguageConfig(language);
    const targetRuntime = langConfig ? langConfig.pistonRuntime : language.toLowerCase();
    const targetVersion = version || (langConfig ? langConfig.version : "*");
    const targetCompiler = langConfig?.wandboxCompiler;

    const mainFileContent = files[0].content;

    // Strategy 1: Attempt Wandbox execution if compiler mapped (zero-auth, reliable)
    if (targetCompiler) {
      try {
        const wandboxController = new AbortController();
        const timeout = setTimeout(() => wandboxController.abort(), 15000);

        const wandboxRes = await fetch(WANDBOX_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            compiler: targetCompiler,
            code: mainFileContent,
            stdin: stdin || "",
            options: "",
            "compiler-option-raw": "",
            "runtime-option-raw": args.join(" "),
          }),
          signal: wandboxController.signal,
        });

        clearTimeout(timeout);

        if (wandboxRes.ok) {
          const wData = await wandboxRes.json();
          const executionTime = Date.now() - startTime;

          const exitCode = typeof wData.status === "number" ? wData.status : 0;
          const stdout = wData.program_output || "";
          const stderr = wData.program_error || "";
          const compileOutput = wData.compiler_output || wData.compiler_error || "";

          const isSuccess = exitCode === 0 && !wData.compiler_error;

          return NextResponse.json({
            success: isSuccess,
            stdout: stdout,
            stderr: stderr,
            compile_output: compileOutput || undefined,
            exitCode: exitCode,
            signal: wData.signal || null,
            executionTime: executionTime,
            language: langConfig?.name || targetRuntime,
            version: langConfig?.version || targetVersion,
          } satisfies ExecutionResponse);
        }
      } catch (wErr) {
        console.warn("Wandbox execution failed, attempting fallback:", wErr);
      }
    }

    // Strategy 2: Attempt Piston Execution
    const formattedFiles = files.map((f, index) => ({
      name: f.name || (index === 0 && langConfig ? langConfig.defaultFileName : `file_${index}`),
      content: f.content,
      encoding: f.encoding || "utf8",
    }));

    const pistonPayload = {
      language: targetRuntime,
      version: targetVersion,
      files: formattedFiles,
      stdin: stdin || "",
      args: args || [],
      compile_timeout: 10000,
      run_timeout: 8000,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(DEFAULT_PISTON_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(pistonPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedError = json.message || errorText;
      } catch {}

      return NextResponse.json(
        {
          success: false,
          stdout: "",
          stderr: `Execution Engine Error: ${parsedError}`,
          exitCode: 1,
          signal: null,
          executionTime: Date.now() - startTime,
          language: targetRuntime,
          version: targetVersion,
          error: parsedError,
        } satisfies ExecutionResponse,
        { status: 200 }
      );
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    const compileResult = data.compile || {};
    const runResult = data.run || {};

    const compileOutput = compileResult.output || compileResult.stderr || "";
    const stdout = runResult.stdout || "";
    const stderr = runResult.stderr || "";
    const exitCode = runResult.code !== undefined ? runResult.code : (compileResult.code ?? 0);
    const signal = runResult.signal || compileResult.signal || null;

    const hasCompileError = compileResult.code !== undefined && compileResult.code !== 0;
    const isSuccess = !hasCompileError && exitCode === 0;

    return NextResponse.json({
      success: isSuccess,
      stdout: stdout,
      stderr: stderr,
      compile_output: compileOutput || undefined,
      exitCode: exitCode,
      signal: signal,
      executionTime: executionTime,
      language: data.language || targetRuntime,
      version: data.version || targetVersion,
    } satisfies ExecutionResponse);
  } catch (err: any) {
    const executionTime = Date.now() - startTime;
    const isTimeout = err?.name === "AbortError" || err?.message?.includes("aborted");

    return NextResponse.json(
      {
        success: false,
        stdout: "",
        stderr: isTimeout
          ? "⏱️ Execution timed out (exceeded limit)."
          : `Execution failed: ${err?.message || "Internal server error"}`,
        exitCode: 1,
        signal: isTimeout ? "SIGKILL" : null,
        executionTime: executionTime,
        language: "unknown",
        version: "unknown",
        error: err?.message,
      } satisfies ExecutionResponse,
      { status: 200 }
    );
  }
}
