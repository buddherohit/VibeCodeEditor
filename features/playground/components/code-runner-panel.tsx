"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Keyboard,
  Globe,
  RotateCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ExecutionResponse } from "@/app/api/execute/route";
import type { LanguageConfig } from "@/features/playground/libs/runner-config";

interface CodeRunnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  result: ExecutionResponse | null;
  languageConfig: LanguageConfig | null;
  stdin: string;
  onStdinChange: (val: string) => void;
  onClearOutput: () => void;
  onRunCode: () => void;
  webCode?: { html: string; css?: string; js?: string };
  isWeb?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const CodeRunnerPanel: React.FC<CodeRunnerPanelProps> = ({
  isOpen,
  onClose,
  isRunning,
  result,
  languageConfig,
  stdin,
  onStdinChange,
  onClearOutput,
  onRunCode,
  webCode,
  isWeb = false,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<string>("output");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [webIframeKey, setWebIframeKey] = useState<number>(0);
  const [webConsoleLogs, setWebConsoleLogs] = useState<Array<{ type: "log" | "error" | "warn"; text: string }>>([]);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const activeTab = controlledTab || internalTab;
  const setActiveTab = (val: string) => {
    setInternalTab(val);
    onTabChange?.(val);
  };

  // Switch to output tab when running starts or finishes
  useEffect(() => {
    if (isRunning) {
      if (isWeb) {
        setActiveTab("web");
      } else {
        setActiveTab("output");
      }
    }
  }, [isRunning, isWeb]);

  // Auto-scroll output when new output arrives
  useEffect(() => {
    if (result && activeTab === "output") {
      outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [result, activeTab]);

  // Listen to messages from web sandbox iframe console
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === "vibecode-web-sandbox") {
        setWebConsoleLogs((prev) => [
          ...prev,
          { type: event.data.type || "log", text: String(event.data.message) },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = [
      result?.compile_output ? `--- COMPILE OUTPUT ---\n${result.compile_output}\n` : "",
      result?.stdout ? `--- STDOUT ---\n${result.stdout}\n` : "",
      result?.stderr ? `--- STDERR ---\n${result.stderr}\n` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    onClearOutput();
    setWebConsoleLogs([]);
  };

  // Generate HTML bundle for web sandbox iframe
  const generateSandboxDoc = () => {
    if (!webCode) return "";
    const html = webCode.html || "";
    const css = webCode.css ? `<style>${webCode.css}</style>` : "";
    const consoleInterceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          
          console.log = function(...args) {
            window.parent.postMessage({ source: 'vibecode-web-sandbox', type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            originalLog.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ source: 'vibecode-web-sandbox', type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            originalError.apply(console, args);
          };
          console.warn = function(...args) {
            window.parent.postMessage({ source: 'vibecode-web-sandbox', type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
            originalWarn.apply(console, args);
          };
          
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ source: 'vibecode-web-sandbox', type: 'error', message: msg + ' (Line: ' + line + ')' }, '*');
            return false;
          };
        })();
      </script>
    `;
    const js = webCode.js ? `<script>${webCode.js}</script>` : "";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${consoleInterceptor}
  ${css}
</head>
<body style="margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  ${html}
  ${js}
</body>
</html>`;
  };

  return (
    <div
      className={cn(
        "border-t bg-zinc-950 text-zinc-100 flex flex-col transition-all duration-300 shadow-2xl relative z-20",
        isExpanded ? "h-[70vh]" : "h-72"
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Console & Runner</span>
          </div>

          {/* Language & Runtime Badge */}
          {languageConfig && (
            <Badge
              variant="outline"
              className="bg-zinc-800/80 text-zinc-300 border-zinc-700 text-[10px] font-mono px-1.5 py-0"
            >
              {languageConfig.name} {result?.version ? `v${result.version}` : `v${languageConfig.version}`}
            </Badge>
          )}

          {/* Execution Status Badge */}
          {isRunning ? (
            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] gap-1 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Executing...
            </Badge>
          ) : result ? (
            result.success ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Success {result.exitCode !== null && `(${result.exitCode})`}
              </Badge>
            ) : (
              <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] gap-1">
                <AlertCircle className="h-3 w-3" />
                {result.exitCode !== null ? `Exit Code ${result.exitCode}` : "Failed"}
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="bg-zinc-800/40 text-zinc-400 border-zinc-700 text-[10px]">
              Ready
            </Badge>
          )}

          {/* Execution Timer */}
          {result?.executionTime !== undefined && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
              <Clock className="h-3 w-3 text-zinc-500" />
              {result.executionTime}ms
            </span>
          )}
        </div>

        {/* Tab Switchers & Panel Controls */}
        <div className="flex items-center gap-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-7">
            <TabsList className="bg-zinc-800 h-7 p-0.5 border border-zinc-700">
              <TabsTrigger
                value="output"
                className="h-6 px-2.5 text-[11px] data-[state=active]:bg-zinc-950 data-[state=active]:text-white"
              >
                💻 Output
                {result?.stderr && (
                  <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="stdin"
                className="h-6 px-2.5 text-[11px] data-[state=active]:bg-zinc-950 data-[state=active]:text-white"
              >
                <Keyboard className="h-3 w-3 mr-1" />
                Stdin
                {stdin.trim().length > 0 && (
                  <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </TabsTrigger>
              {isWeb && (
                <TabsTrigger
                  value="web"
                  className="h-6 px-2.5 text-[11px] data-[state=active]:bg-zinc-950 data-[state=active]:text-white"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Live Web
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Quick Action Buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={!result || (!result.stdout && !result.stderr && !result.compile_output)}
                className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isCopied ? "Copied!" : "Copy Output"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Clear Console
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isExpanded ? "Restore Height" : "Maximize Panel"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Close Panel
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-hidden bg-zinc-950 flex flex-col font-mono text-xs">
        {activeTab === "output" && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
            {isRunning ? (
              <div className="flex items-center gap-2 text-zinc-400 py-4 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Running code on Piston Execution Engine...</span>
              </div>
            ) : !result && webConsoleLogs.length === 0 ? (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Terminal className="h-8 w-8 text-zinc-700" />
                <p className="text-sm font-sans font-medium text-zinc-400">Terminal ready for execution</p>
                <p className="text-xs font-sans text-zinc-500">
                  Click <span className="text-emerald-400 font-semibold">▶ Run Code</span> or press{" "}
                  <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Ctrl+Enter</kbd>
                </p>
              </div>
            ) : (
              <>
                {/* Compilation Output */}
                {result?.compile_output && (
                  <div className="rounded border border-amber-900/40 bg-amber-950/20 p-2.5 text-amber-200">
                    <div className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Compilation Output:
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                      {result.compile_output}
                    </pre>
                  </div>
                )}

                {/* Standard Output (stdout) */}
                {result?.stdout && (
                  <div className="text-zinc-100">
                    <pre className="whitespace-pre-wrap break-words leading-relaxed selection:bg-emerald-500/30">
                      {result.stdout}
                    </pre>
                  </div>
                )}

                {/* Standard Error (stderr) */}
                {result?.stderr && (
                  <div className="rounded border border-rose-900/40 bg-rose-950/30 p-2.5 text-rose-300">
                    <div className="text-[11px] font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Runtime Error / Stderr:
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed selection:bg-rose-500/30">
                      {result.stderr}
                    </pre>
                  </div>
                )}

                {/* Web Console Logs if any */}
                {webConsoleLogs.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Web Console Output
                    </div>
                    {webConsoleLogs.map((log, index) => (
                      <div
                        key={index}
                        className={cn(
                          "py-0.5 px-1.5 rounded text-[11px] flex items-start gap-2",
                          log.type === "error"
                            ? "text-rose-400 bg-rose-950/30"
                            : log.type === "warn"
                            ? "text-amber-400 bg-amber-950/30"
                            : "text-zinc-200"
                        )}
                      >
                        <span className="text-zinc-600 select-none">›</span>
                        <pre className="whitespace-pre-wrap break-words flex-1">{log.text}</pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Execution Footer Summary */}
                {result && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      Process finished with exit code{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          result.exitCode === 0 ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {result.exitCode ?? 0}
                      </span>
                    </span>
                    {result.executionTime !== undefined && <span>Time: {result.executionTime}ms</span>}
                  </div>
                )}
                <div ref={outputEndRef} />
              </>
            )}
          </div>
        )}

        {activeTab === "stdin" && (
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-sans">
                Standard Input (passed to <code className="text-emerald-400 font-mono">cin</code>,{" "}
                <code className="text-emerald-400 font-mono">input()</code>,{" "}
                <code className="text-emerald-400 font-mono">Scanner</code>, etc.)
              </span>
              <div className="flex items-center gap-2">
                {stdin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStdinChange("")}
                    className="h-6 text-[11px] text-zinc-400 hover:text-zinc-100"
                  >
                    Clear Input
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Enter inputs here (one line per input)..."
              className="flex-1 resize-none bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-xs focus-visible:ring-emerald-500/50 p-2.5 min-h-[100px]"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{stdin.split("\n").filter(Boolean).length} input line(s)</span>
              <Button
                size="sm"
                onClick={onRunCode}
                disabled={isRunning}
                className="h-6 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
              >
                <Play className="h-3 w-3 fill-current" />
                Run with this Input
              </Button>
            </div>
          </div>
        )}

        {activeTab === "web" && isWeb && (
          <div className="flex-1 flex flex-col bg-white">
            <div className="flex items-center justify-between px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border-b text-xs text-zinc-600 dark:text-zinc-400">
              <span>Live Sandboxed HTML Preview</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setWebIframeKey((k) => k + 1)}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
            <iframe
              key={webIframeKey}
              title="Web Sandbox Preview"
              srcDoc={generateSandboxDoc()}
              sandbox="allow-scripts allow-modals"
              className="flex-1 w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
