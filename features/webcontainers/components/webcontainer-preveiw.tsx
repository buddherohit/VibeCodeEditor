"use client";

import React, { useEffect, useState, useRef } from "react";
import type { TemplateFolder, TemplateFile } from "@/features/playground/libs/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle, RotateCw, ExternalLink, Globe, Play, Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
const TerminalComponent = dynamic(() => import("./terminal"), { ssr: false });
import { WebContainer } from "@webcontainer/api";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
}

// Helpers to inspect files in templateData
const checkHasPackageJson = (folder?: TemplateFolder): boolean => {
  if (!folder || !folder.items) return false;
  for (const item of folder.items) {
    if ("folderName" in item) {
      if (checkHasPackageJson(item as any)) return true;
    } else if (item.filename === "package" && item.fileExtension === "json") {
      return true;
    }
  }
  return false;
};

const findFileInTemplate = (folder: TemplateFolder, filename: string, ext: string): TemplateFile | null => {
  if (!folder || !folder.items) return null;
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFileInTemplate(item as any, filename, ext);
      if (res) return res;
    } else if (item.filename.toLowerCase() === filename.toLowerCase() && item.fileExtension.toLowerCase() === ext.toLowerCase()) {
      return item;
    }
  }
  return null;
};

const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  writeFileSync,
  forceResetup = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);

  // Ref to access terminal methods
  const terminalRef = useRef<any>(null);

  const hasPkgJson = checkHasPackageJson(templateData);
  const htmlFile = findFileInTemplate(templateData, "index", "html");
  const cssFile = findFileInTemplate(templateData, "style", "css");
  const jsFile = findFileInTemplate(templateData, "script", "js") || findFileInTemplate(templateData, "index", "js");

  // Reset setup state when forceResetup changes
  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        // Step 1: Transform & Mount files
        setLoadingState((prev) => ({ ...prev, transforming: true }));
        setCurrentStep(1);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("🔄 Transforming template files...\r\n");
        }

        // @ts-ignore
        const files = transformToWebContainerFormat(templateData);

        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));
        setCurrentStep(2);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📁 Mounting files to WebContainer...\r\n");
        }

        await instance.mount(files);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Files mounted successfully\r\n");
        }

        // Verify if package.json actually exists in the mounted filesystem
        let hasMountedPkgJson = false;
        let pkgJsonObj: any = null;
        try {
          const pkgJsonStr = await instance.fs.readFile("package.json", "utf8");
          if (pkgJsonStr && pkgJsonStr.trim().length > 0) {
            pkgJsonObj = JSON.parse(pkgJsonStr);
            hasMountedPkgJson = true;
          }
        } catch {
          hasMountedPkgJson = false;
        }

        // If this is not a Node.js project (no package.json), stop here!
        if (!hasMountedPkgJson && !hasPkgJson) {
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              "ℹ️ Standalone project loaded. Terminal is ready for commands.\r\n"
            );
          }
          setLoadingState({
            transforming: false,
            mounting: false,
            installing: false,
            starting: false,
            ready: true,
          });
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
          return;
        }

        // Step 3: Install dependencies for Node.js projects
        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📦 Running npm install...\r\n");
        }

        try {
          const installProcess = await instance.spawn("npm", ["install"]);

          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                if (terminalRef.current?.writeToTerminal) {
                  terminalRef.current.writeToTerminal(data);
                }
              },
            })
          );

          const installExitCode = await installProcess.exit;

          if (installExitCode === 0) {
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal("✅ Dependencies installed successfully\r\n");
            }
          } else {
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                `\r\n⚠️ npm install exited with code ${installExitCode}. Proceeding to start server...\r\n`
              );
            }
          }
        } catch (installErr) {
          console.warn("npm install execution notice:", installErr);
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal("⚠️ Notice: continuing startup...\r\n");
          }
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // Step 4: Determine start command and start the server
        let startCmd = ["run", "dev"];
        if (pkgJsonObj?.scripts?.dev) {
          startCmd = ["run", "dev"];
        } else if (pkgJsonObj?.scripts?.start) {
          startCmd = ["run", "start"];
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`🚀 Starting server with: npm ${startCmd.join(" ")}...\r\n`);
        }

        // Listen for server ready event
        instance.on("server-ready", (port: number, url: string) => {
          console.log(`Server ready on port ${port} at ${url}`);
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(`🌐 Live preview available at: ${url}\r\n`);
          }
          setPreviewUrl(url);
          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        try {
          const startProcess = await instance.spawn("npm", startCmd);

          startProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                if (terminalRef.current?.writeToTerminal) {
                  terminalRef.current.writeToTerminal(data);
                }
              },
            })
          );
        } catch (startErr) {
          console.warn("Error starting dev server:", startErr);
        }
      } catch (err) {
        console.error("Error setting up container:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`❌ Error: ${errorMessage}\r\n`);
        }

        setSetupError(errorMessage);
        setIsSetupInProgress(false);
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress, hasPkgJson]);

  const handleRefreshPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg bg-gray-50 dark:bg-zinc-900 border">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="text-lg font-medium">Initializing Environment</h3>
          <p className="text-sm text-muted-foreground">
            Booting the in-browser runtime...
          </p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Setup Error</h3>
          </div>
          <p className="text-sm mb-4">{error || setupError}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsSetupComplete(false);
              setIsSetupInProgress(false);
              setSetupError(null);
            }}
          >
            <RotateCw className="h-4 w-4 mr-2" /> Retry Setup
          </Button>
        </div>
      </div>
    );
  }

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepIndex === currentStep) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStepText = (stepIndex: number, label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;

    return (
      <span
        className={`text-sm font-medium ${
          isComplete
            ? "text-green-600 dark:text-green-400"
            : isActive
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    );
  };

  // Generate static HTML bundle if no package.json but HTML exists
  const getStaticHtmlDoc = () => {
    if (!htmlFile) return "";
    const html = htmlFile.content || "";
    const css = cssFile?.content ? `<style>${cssFile.content}</style>` : "";
    const js = jsFile?.content ? `<script>${jsFile.content}</script>` : "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8">${css}</head><body>${html}${js}</body></html>`;
  };

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Browser address bar / controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleRefreshPreview}
            disabled={!previewUrl && !htmlFile}
            title="Reload Preview"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleOpenExternal}
            disabled={!previewUrl}
            title="Open in New Tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-background border rounded-md px-2.5 py-1 text-xs text-muted-foreground max-w-sm truncate">
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {previewUrl
              ? previewUrl
              : htmlFile
              ? "Live HTML Canvas"
              : hasPkgJson
              ? "http://localhost:3000 (starting...)"
              : "Standalone Runner Mode"}
          </span>
        </div>

        <div>
          {previewUrl || htmlFile ? (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
              ● Live
            </Badge>
          ) : hasPkgJson ? (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
              Starting
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
              Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Case 1: Node.js Web App with Live URL */}
      {previewUrl ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 bg-white dark:bg-zinc-950 relative min-h-0">
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-none"
              title="WebContainer Live Preview"
              allow="cross-origin-isolated"
            />
          </div>
          <div className="h-48 border-t min-h-0">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      ) : htmlFile ? (
        /* Case 2: Static HTML Project */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 bg-white dark:bg-zinc-950 relative min-h-0">
            <iframe
              key={iframeKey}
              srcDoc={getStaticHtmlDoc()}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-none"
              title="Static HTML Preview"
            />
          </div>
          <div className="h-44 border-t min-h-0">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      ) : hasPkgJson ? (
        /* Case 3: Node.js project building */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="w-full max-w-md p-6 m-4 rounded-lg bg-card border shadow-sm mx-auto shrink-0">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Building Runtime Preview
            </h4>
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2 mb-5"
            />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {getStepIcon(1)}
                {getStepText(1, "Transforming template files")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(2)}
                {getStepText(2, "Mounting virtual filesystem")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(3)}
                {getStepText(3, "Installing packages (npm install)")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(4)}
                {getStepText(4, "Starting local dev server")}
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 min-h-0">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full rounded-md border overflow-hidden"
            />
          </div>
        </div>
      ) : (
        /* Case 4: Standalone Code Project (Java, Python, C++, etc.) */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 m-4 rounded-xl border bg-card/60 backdrop-blur shadow-sm space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Multi-Language Online Runner Active</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This code runs directly in the online execution environment. Click{" "}
              <strong className="text-foreground">▶ Run Code</strong> or press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Ctrl+Enter</kbd>{" "}
              to run and inspect stdout, stderr, and execution time in the Console Drawer.
            </p>
          </div>

          <div className="flex-1 p-3 min-h-0 flex flex-col">
            <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>Interactive Shell Terminal</span>
            </div>
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="flex-1 rounded-md border overflow-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;