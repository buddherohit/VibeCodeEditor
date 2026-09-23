"use client";

import React, { useEffect, useState, useRef } from "react";
import type { TemplateFolder } from "@/features/playground/libs/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle, RotateCw, ExternalLink, Globe, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TerminalComponent from "./terminal";
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
      // Don't run setup if it's already complete or in progress
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        // Step 1: Transform data
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

        // Step 2: Mount files
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📁 Mounting files to WebContainer...\r\n");
        }

        await instance.mount(files);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Files mounted successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        // Step 3: Install dependencies
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("📦 Running npm install...\r\n");
        }

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

        if (installExitCode !== 0) {
          throw new Error(`npm install exited with code ${installExitCode}`);
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal("✅ Dependencies installed successfully\r\n");
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // Step 4: Determine start command and start the server
        let startCmd = ["run", "dev"];
        try {
          const pkgJsonStr = await instance.fs.readFile("package.json", "utf8");
          const pkgJson = JSON.parse(pkgJsonStr);
          if (pkgJson.scripts?.dev) {
            startCmd = ["run", "dev"];
          } else if (pkgJson.scripts?.start) {
            startCmd = ["run", "start"];
          }
        } catch (e) {
          console.warn("Could not read package.json scripts, defaulting to npm run dev");
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
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

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
          <h3 className="text-lg font-medium">Initializing WebContainer</h3>
          <p className="text-sm text-muted-foreground">
            Booting the in-browser runtime environment...
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
            disabled={!previewUrl}
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
          <span className="truncate">{previewUrl || "http://localhost:3000 (starting...)"}</span>
        </div>

        <div>
          {previewUrl ? (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
              ● Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
              Starting
            </Badge>
          )}
        </div>
      </div>

      {!previewUrl ? (
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

          {/* Terminal */}
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Live Preview Iframe */}
          <div className="flex-1 bg-white dark:bg-zinc-950 relative min-h-0">
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-none"
              title="WebContainer Live Preview"
              allow="cross-origin-isolated"
            />
          </div>

          {/* Terminal at bottom when preview is running */}
          <div className="h-56 border-t min-h-0">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;