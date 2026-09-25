"use client";

import React, { useRef, useEffect } from "react";
import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TemplateFileTree } from "@/features/playground/components/playground-explorer";
import type { TemplateFile } from "@/features/playground/libs/path-to-json";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  FolderOpen,
  AlertCircle,
  Save,
  X,
  Settings,
  Download,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadProjectAsZip } from "@/lib/zip-export";
import { EditorSettingsModal } from "@/components/modal/editor-settings-modal";
import { FileIcon } from "@/components/file-icon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const WebContainerPreview = dynamic(
  () => import("@/features/webcontainers/components/webcontainer-preveiw"),
  { ssr: false }
);

import LoadingStep from "@/components/ui/loader";
import { PlaygroundEditor } from "@/features/playground/components/playground-editor";
import ToggleAI from "@/features/playground/components/toggle-ai";
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer";
import { usePlayground } from "@/features/playground/hooks/usePlayground";
import { useAISuggestions } from "@/features/playground/hooks/useAISuggestion";
import { useWebContainer } from "@/features/webcontainers/hooks/useWebContainer";
import { TemplateFolder } from "@/features/playground/types";
import { findFilePath } from "@/features/playground/libs";
import { ConfirmationDialog } from "@/features/playground/components/dialogs/conformation-dialog";
import { RunCodeButton } from "@/features/playground/components/run-code-button";
import { CodeRunnerPanel } from "@/features/playground/components/code-runner-panel";
import { StatusBar } from "@/features/playground/components/status-bar";
import { getLanguageConfig, isWebFile } from "@/features/playground/libs/runner-config";
import type { ExecutionResponse } from "@/app/api/execute/route";
import { Terminal as TerminalIcon } from "lucide-react";

const MainPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // UI state
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    theme: "modern-dark",
    fontSize: 14,
    wordWrap: true,
    minimap: true,
    tabSize: 2,
  });

  // Load editor settings from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibecode_editor_settings");
      if (saved) {
        setEditorSettings(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const handleSaveEditorSettings = (newSettings: typeof editorSettings) => {
    setEditorSettings(newSettings);
    try {
      localStorage.setItem("vibecode_editor_settings", JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Custom hooks
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);
  const aiSuggestions = useAISuggestions();
  const {
    activeFileId,
    closeAllFiles,
    openFile,
    closeFile,
    editorContent,
    updateFileContent,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    openFiles,
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
  } = useFileExplorer();

  const checkHasPackageJson = (folder?: TemplateFolder | null): boolean => {
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

  const isWebFrameworkProject = Boolean(
    (playgroundData?.template &&
      ["REACT", "NEXTJS", "EXPRESS", "VUE", "HONO", "ANGULAR", "NODE"].includes(
        playgroundData.template.toUpperCase()
      )) ||
      checkHasPackageJson(templateData)
  );

  // Sync preview panel visibility based on project type
  useEffect(() => {
    if (playgroundData || templateData) {
      const isFramework = Boolean(
        (playgroundData?.template &&
          ["REACT", "NEXTJS", "EXPRESS", "VUE", "HONO", "ANGULAR", "NODE"].includes(
            playgroundData.template.toUpperCase()
          )) ||
          checkHasPackageJson(templateData)
      );
      setIsPreviewVisible(isFramework);
    }
  }, [playgroundData?.template, templateData]);

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    // @ts-ignore
  } = useWebContainer({
    templateData: templateData || { folderName: "Root", items: [] },
    enabled: isWebFrameworkProject,
  });

  const lastSyncedContent = useRef<Map<string, string>>(new Map());

  // Helper to find first file in folder
  const findFirstFile = (folder: TemplateFolder): TemplateFile | null => {
    for (const item of folder.items) {
      if ("folderName" in item) {
        const found = findFirstFile(item);
        if (found) return found;
      } else {
        return item;
      }
    }
    return null;
  };

  // Set template data when playground loads
  React.useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  // Initialize zustand templateData and auto-open first file on first load
  React.useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
      const first = findFirstFile(templateData);
      if (first) {
        openFile(first);
      }
    }
  }, [templateData, openFiles.length, setTemplateData, openFile]);

  // Create wrapper functions that pass saveTemplateData
  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData]
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData]
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData]
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData]
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFolder, saveTemplateData]
  );

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isExporting, setIsExporting] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  const handleSave = useCallback(
    async (fileId?: string, silent = false) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        setSaveStatus("saving");
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          if (!silent) {
            toast.error(
              `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`
            );
          }
          setSaveStatus("unsaved");
          return;
        }

        // Update file content in template data (clone for immutability)
        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );
        const updateFileContent = (items: any[]): any[] =>
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateFileContent(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });
        updatedTemplateData.items = updateFileContent(
          updatedTemplateData.items
        );

        // Sync with WebContainer
        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance && instance.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        // Use saveTemplateData to persist changes
        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);

        // Update open files
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
                ...f,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : f
        );
        setOpenFiles(updatedOpenFiles);
        setSaveStatus("saved");

        if (!silent) {
          toast.success(
            `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
        }
      } catch (error) {
        setSaveStatus("unsaved");
        console.error("Error saving file:", error);
        if (!silent) {
          toast.error(
            `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
        }
        throw error;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ]
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      setSaveStatus("saving");
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id, true)));
      setSaveStatus("saved");
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      setSaveStatus("unsaved");
      toast.error("Failed to save some files");
    }
  };

  // Debounced Auto-Save effect (saves 2.5s after editing stops)
  useEffect(() => {
    if (hasUnsavedChanges) {
      setSaveStatus("unsaved");
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          const unsaved = useFileExplorer.getState().openFiles.filter((f) => f.hasUnsavedChanges);
          if (unsaved.length > 0) {
            setSaveStatus("saving");
            await Promise.all(unsaved.map((f) => handleSave(f.id, true)));
            setSaveStatus("saved");
          }
        } catch (e) {
          setSaveStatus("unsaved");
        }
      }, 2500);
    } else {
      setSaveStatus("saved");
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, openFiles, handleSave]);

  const handleExportZip = async () => {
    const currentData = useFileExplorer.getState().templateData;
    if (!currentData) {
      toast.error("No project files available to export");
      return;
    }
    try {
      setIsExporting(true);
      await downloadProjectAsZip(currentData, playgroundData?.title || playgroundData?.name || "vibecode-project");
      toast.success("Project downloaded as ZIP successfully!");
    } catch (e) {
      toast.error("Failed to download project ZIP");
    } finally {
      setIsExporting(false);
    }
  };

  // Multi-language online code runner state
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  const [stdinInput, setStdinInput] = useState("");
  const [isRunnerPanelOpen, setIsRunnerPanelOpen] = useState(false);
  const [activeRunnerTab, setActiveRunnerTab] = useState<string>("output");

  const isActiveFileWeb = activeFile ? isWebFile(activeFile.fileExtension) : false;
  const activeLanguageConfig = activeFile ? getLanguageConfig(activeFile.fileExtension) : null;

  const webSandboxCode = React.useMemo(() => {
    if (!activeFile) return undefined;
    let html = "";
    let css = "";
    let js = "";

    if (activeFile.fileExtension.toLowerCase() === "html" || activeFile.fileExtension.toLowerCase() === "htm") {
      html = activeFile.content || "";
    }

    openFiles.forEach((f) => {
      if (f.fileExtension.toLowerCase() === "css" && !css) {
        css = f.content || "";
      }
      if ((f.fileExtension.toLowerCase() === "js" || f.fileExtension.toLowerCase() === "ts") && !js) {
        js = f.content || "";
      }
    });

    return { html, css, js };
  }, [activeFile, openFiles]);

  const handleRunCode = useCallback(async () => {
    if (!activeFile) {
      toast.error("Please select a file to run");
      return;
    }

    if (isWebFile(activeFile.fileExtension)) {
      setIsRunnerPanelOpen(true);
      setActiveRunnerTab("web");
      toast.success(`Rendering ${activeFile.filename}.${activeFile.fileExtension} preview`);
      return;
    }

    const langConfig = getLanguageConfig(activeFile.fileExtension);
    const language = langConfig ? langConfig.pistonRuntime : activeFile.fileExtension;

    setIsRunnerPanelOpen(true);
    setIsRunningCode(true);
    setActiveRunnerTab("output");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          version: langConfig?.version || "*",
          files: [
            {
              name: `${activeFile.filename}.${activeFile.fileExtension}`,
              content: activeFile.content || "",
            },
          ],
          stdin: stdinInput,
        }),
      });

      const data: ExecutionResponse = await response.json();
      setExecutionResult(data);

      if (data.success) {
        toast.success(`Execution completed (${data.executionTime}ms)`);
      } else {
        toast.error(`Execution finished with errors`);
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      setExecutionResult({
        success: false,
        stdout: "",
        stderr: `Execution error: ${err?.message || "Failed to contact execution engine"}`,
        exitCode: 1,
        signal: null,
        language,
        version: "",
        error: err?.message,
      });
      toast.error("Failed to execute code");
    } finally {
      setIsRunningCode(false);
    }
  }, [activeFile, stdinInput]);

  // Global Keyboard shortcuts: Ctrl+S (Save), Ctrl+Enter (Run Code), Ctrl+` (Toggle Console)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setIsRunnerPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleRunCode]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Loading Playground
          </h2>
          <div className="mb-8">
            <LoadingStep
              currentStep={1}
              step={1}
              label="Loading playground data"
            />
            <LoadingStep
              currentStep={2}
              step={2}
              label="Setting up environment"
            />
            <LoadingStep currentStep={3} step={3} label="Ready to code" />
          </div>
        </div>
      </div>
    );
  }

  // No template data
  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-600 mb-2">
          No template data available
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Template
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenameFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex flex-1 items-center justify-between gap-2">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-medium">
                    {playgroundData?.title || playgroundData?.name || "Code Playground"}
                  </h1>
                  {saveStatus === "saving" && (
                    <span className="inline-flex items-center text-xs text-blue-500 gap-1 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </span>
                  )}
                  {saveStatus === "saved" && !hasUnsavedChanges && (
                    <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Saved
                    </span>
                  )}
                  {saveStatus === "unsaved" && (
                    <span className="inline-flex items-center text-xs text-amber-500 gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {openFiles.length} file(s) open • Auto-save enabled
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <RunCodeButton
                  onRun={handleRunCode}
                  isRunning={isRunningCode}
                  disabled={!activeFile}
                  languageName={activeLanguageConfig?.name}
                  isWeb={isActiveFileWeb}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isRunnerPanelOpen ? "secondary" : "outline"}
                      onClick={() => setIsRunnerPanelOpen(!isRunnerPanelOpen)}
                      className="gap-1.5 text-xs"
                    >
                      <TerminalIcon className="h-4 w-4 text-emerald-500" />
                      <span className="hidden md:inline">Console</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Console / Runner Panel (Ctrl+`)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave()}
                      disabled={!activeFile || !activeFile.hasUnsavedChanges}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Current File (Ctrl+S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportZip}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Export ZIP
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download Project as ZIP</TooltipContent>
                </Tooltip>

                <ToggleAI
                  isEnabled={aiSuggestions.isEnabled}
                  onToggle={aiSuggestions.toggleEnabled}
                  suggestionLoading={aiSuggestions.isLoading}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsRunnerPanelOpen(!isRunnerPanelOpen)}
                    >
                      {isRunnerPanelOpen ? "Hide" : "Show"} Console Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                    >
                      {isPreviewVisible ? "Hide" : "Show"} WebContainer Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
                      Editor Preferences
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveAll} disabled={!hasUnsavedChanges}>
                      Save All Files
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportZip}>
                      Download Project ZIP
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={closeAllFiles}>
                      Close All Files
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>


          <div className="h-[calc(100vh-4rem)]">
            {openFiles.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* File Tabs */}
                <div className="border-b bg-muted/30">
                  <Tabs
                    value={activeFileId || ""}
                    onValueChange={setActiveFileId}
                  >
                    <div className="flex items-center justify-between px-4 py-2">
                      <TabsList className="h-8 bg-transparent p-0">
                        {openFiles.map((file) => (
                          <TabsTrigger
                            key={file.id}
                            value={file.id}
                            className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group"
                          >
                            <div className="flex items-center gap-2">
                              <FileIcon
                                filename={file.filename}
                                fileExtension={file.fileExtension}
                                size={14}
                                className="h-3.5 w-3.5"
                              />
                              <span className="font-medium text-xs">
                                {file.filename}.{file.fileExtension}
                              </span>
                              {file.hasUnsavedChanges && (
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                              )}
                              <span
                                className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeFile(file.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {openFiles.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={closeAllFiles}
                          className="h-6 px-2 text-xs"
                        >
                          Close All
                        </Button>
                      )}
                    </div>
                  </Tabs>
                </div>

                {/* VS Code Style Breadcrumb Bar */}
                {activeFile && (
                  <div className="flex items-center gap-1.5 px-4 py-1 text-xs text-muted-foreground bg-muted/10 border-b select-none font-mono">
                    <span className="hover:text-foreground cursor-pointer">
                      {playgroundData?.title || playgroundData?.name || "Workspace"}
                    </span>
                    <span className="text-zinc-500">›</span>
                    <FileIcon
                      filename={activeFile.filename}
                      fileExtension={activeFile.fileExtension}
                      size={13}
                      className="h-3.5 w-3.5 inline mr-0.5"
                    />
                    <span className="text-foreground font-medium">
                      {activeFile.filename}.{activeFile.fileExtension}
                    </span>
                  </div>
                )}

                {/* Editor and Preview */}
                <div className="flex-1">
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full"
                  >
                    <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                      <div className="h-full flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 relative">
                          <PlaygroundEditor
                            activeFile={activeFile}
                            content={activeFile?.content || ""}
                            onContentChange={(value) =>
                              activeFileId && updateFileContent(activeFileId, value)
                            }
                            theme={editorSettings.theme}
                            customOptions={{
                              fontSize: editorSettings.fontSize,
                              wordWrap: editorSettings.wordWrap ? "on" : "off",
                              tabSize: editorSettings.tabSize,
                              minimap: { enabled: editorSettings.minimap },
                            }}
                            suggestion={aiSuggestions.suggestion}
                            suggestionLoading={aiSuggestions.isLoading}
                            suggestionPosition={aiSuggestions.position}
                            onAcceptSuggestion={(editor, monaco) =>
                              aiSuggestions.acceptSuggestion(editor, monaco)
                            }
                            onRejectSuggestion={(editor) =>
                              aiSuggestions.rejectSuggestion(editor)
                            }
                            onTriggerSuggestion={(type, editor) =>
                              aiSuggestions.fetchSuggestion(type, editor)
                            }
                          />
                        </div>

                        {isRunnerPanelOpen && (
                          <CodeRunnerPanel
                            isOpen={isRunnerPanelOpen}
                            onClose={() => setIsRunnerPanelOpen(false)}
                            isRunning={isRunningCode}
                            result={executionResult}
                            languageConfig={activeLanguageConfig}
                            stdin={stdinInput}
                            onStdinChange={setStdinInput}
                            onClearOutput={() => setExecutionResult(null)}
                            onRunCode={handleRunCode}
                            webCode={webSandboxCode}
                            isWeb={isActiveFileWeb}
                            activeTab={activeRunnerTab}
                            onTabChange={setActiveRunnerTab}
                          />
                        )}
                      </div>
                    </ResizablePanel>

                    {isPreviewVisible && (
                      <>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={50}>
                          <WebContainerPreview
                            templateData={templateData}
                            instance={instance}
                            writeFileSync={writeFileSync}
                            isLoading={containerLoading}
                            error={containerError}
                            serverUrl={serverUrl!}
                            forceResetup={false}
                          />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </div>

                {/* VS Code Bottom Status Bar */}
                <StatusBar
                  isConnected={true}
                  hasUnsavedChanges={hasUnsavedChanges}
                  activeFile={activeFile ? `${activeFile.filename}.${activeFile.fileExtension}` : undefined}
                  language={activeLanguageConfig?.name || activeFile?.fileExtension || "plaintext"}
                  encoding="UTF-8"
                  autoSaveEnabled={true}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
                <FileText className="h-16 w-16 text-gray-300" />
                <div className="text-center">
                  <p className="text-lg font-medium">No files open</p>
                  <p className="text-sm text-gray-500">
                    Select a file from the sidebar to start editing
                  </p>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={confirmationDialog.onCancel}
        setIsOpen={(open) => setConfirmationDialog((prev) => ({ ...prev, isOpen: open }))}
      />

      <EditorSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={editorSettings}
        onSaveSettings={handleSaveEditorSettings}
      />
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;

