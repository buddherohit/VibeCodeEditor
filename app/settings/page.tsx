"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Code2,
  Terminal,
  Sparkles,
  Palette,
  User,
  Sliders,
  Check,
  RotateCcw,
  Moon,
  Sun,
  Laptop,
  Zap,
  Save,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface EditorSettingsState {
  theme: string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  formatOnSave: boolean;
  cursorBlinking: string;
  lineNumbers: string;
}

interface RunnerSettingsState {
  engine: "auto" | "wandbox" | "piston";
  defaultLanguage: string;
  timeout: number;
}

interface AISettingsState {
  enabled: boolean;
  debounceMs: number;
  triggerMode: "auto" | "manual";
}

const DEFAULT_EDITOR_SETTINGS: EditorSettingsState = {
  theme: "modern-dark",
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  formatOnSave: true,
  cursorBlinking: "smooth",
  lineNumbers: "on",
};

const DEFAULT_RUNNER_SETTINGS: RunnerSettingsState = {
  engine: "auto",
  defaultLanguage: "java",
  timeout: 10,
};

const DEFAULT_AI_SETTINGS: AISettingsState = {
  enabled: true,
  debounceMs: 500,
  triggerMode: "auto",
};

const THEME_OPTIONS = [
  {
    id: "modern-dark",
    name: "Modern Slate",
    description: "Deep obsidian theme tailored for long coding sessions",
    previewBg: "bg-zinc-900 border-zinc-700",
    badge: "Recommended",
  },
  {
    id: "vs-dark",
    name: "VS Dark",
    description: "Classic Microsoft Visual Studio Dark theme",
    previewBg: "bg-[#1e1e1e] border-zinc-700",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    description: "Official GitHub Dark Dimmed high-contrast palette",
    previewBg: "bg-[#0d1117] border-zinc-700",
  },
  {
    id: "dracula",
    name: "Dracula Vibrant",
    description: "Famous gothic dark theme with purple and cyan neon accents",
    previewBg: "bg-[#282a36] border-purple-900/50",
  },
  {
    id: "monokai",
    name: "Monokai Pro",
    description: "High-readability warm retro theme for syntax highlighting",
    previewBg: "bg-[#272822] border-yellow-900/40",
  },
  {
    id: "light",
    name: "Daylight Paper",
    description: "Clean bright light theme with high black text contrast",
    previewBg: "bg-zinc-100 border-zinc-300 text-zinc-900",
  },
];

export default function SettingsPage() {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const { data: session } = useSession();

  const [editorSettings, setEditorSettings] = useState<EditorSettingsState>(DEFAULT_EDITOR_SETTINGS);
  const [runnerSettings, setRunnerSettings] = useState<RunnerSettingsState>(DEFAULT_RUNNER_SETTINGS);
  const [aiSettings, setAiSettings] = useState<AISettingsState>(DEFAULT_AI_SETTINGS);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const savedEditor = localStorage.getItem("vibecode_editor_settings");
      if (savedEditor) {
        setEditorSettings({ ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(savedEditor) });
      }

      const savedRunner = localStorage.getItem("vibecode_runner_settings");
      if (savedRunner) {
        setRunnerSettings({ ...DEFAULT_RUNNER_SETTINGS, ...JSON.parse(savedRunner) });
      }

      const savedAi = localStorage.getItem("vibecode_ai_settings");
      if (savedAi) {
        setAiSettings({ ...DEFAULT_AI_SETTINGS, ...JSON.parse(savedAi) });
      }
    } catch (e) {
      console.warn("Failed to read settings from localStorage", e);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  const handleSaveAll = () => {
    try {
      localStorage.setItem("vibecode_editor_settings", JSON.stringify(editorSettings));
      localStorage.setItem("vibecode_runner_settings", JSON.stringify(runnerSettings));
      localStorage.setItem("vibecode_ai_settings", JSON.stringify(aiSettings));
      toast.success("All preferences saved and synchronized!");
    } catch (e) {
      toast.error("Failed to persist settings");
    }
  };

  const handleResetToDefaults = () => {
    setEditorSettings(DEFAULT_EDITOR_SETTINGS);
    setRunnerSettings(DEFAULT_RUNNER_SETTINGS);
    setAiSettings(DEFAULT_AI_SETTINGS);
    try {
      localStorage.removeItem("vibecode_editor_settings");
      localStorage.removeItem("vibecode_runner_settings");
      localStorage.removeItem("vibecode_ai_settings");
      toast.info("All preferences reset to factory defaults");
    } catch (e) {}
  };

  if (!hasLoaded) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Workspace Settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Preferences & Configuration
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Customize Monaco code editor themes, DSA execution engines, AI Copilot, and appearance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="rounded-xl text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="mt-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-11 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl mb-8">
            <TabsTrigger
              value="editor"
              className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
            >
              <Code2 className="w-4 h-4 text-cyan-500" />
              Monaco Editor
            </TabsTrigger>
            <TabsTrigger
              value="runner"
              className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
            >
              <Terminal className="w-4 h-4 text-emerald-500" />
              Code Execution Engine
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Assistant (Gemini)
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              UI Appearance
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-xl text-xs font-semibold gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4 text-rose-500" />
              Account & Profile
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MONACO EDITOR */}
          <TabsContent value="editor" className="space-y-6">
            {/* Editor Theme Section */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-500" /> Editor Syntax Theme
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                Choose the color theme for code rendering inside the Monaco editor.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((themeOption) => {
                  const isSelected = editorSettings.theme === themeOption.id;
                  return (
                    <div
                      key={themeOption.id}
                      onClick={() =>
                        setEditorSettings((prev) => ({ ...prev, theme: themeOption.id }))
                      }
                      className={`cursor-pointer relative p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/5 shadow-md"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border ${themeOption.previewBg}`} />
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            {themeOption.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {themeOption.description}
                      </p>
                      {themeOption.badge && (
                        <Badge
                          variant="secondary"
                          className="mt-3 text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-none"
                        >
                          {themeOption.badge}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography & Sizing */}
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs space-y-6">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" /> Typography & Layout
              </h2>

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Font Size ({editorSettings.fontSize}px)
                    </Label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Controls the text size of the active Monaco editor buffer.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold">
                    {editorSettings.fontSize} px
                  </span>
                </div>
                <Slider
                  min={11}
                  max={24}
                  step={1}
                  value={[editorSettings.fontSize]}
                  onValueChange={(val) =>
                    setEditorSettings((prev) => ({ ...prev, fontSize: val[0] }))
                  }
                  className="w-full"
                />
              </div>

              {/* Tab Size */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Tab Indentation Size
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Number of spaces inserted when pressing the Tab key.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
                  <Button
                    size="sm"
                    variant={editorSettings.tabSize === 2 ? "secondary" : "ghost"}
                    onClick={() => setEditorSettings((prev) => ({ ...prev, tabSize: 2 }))}
                    className="h-7 px-3 text-xs rounded-lg font-bold"
                  >
                    2 Spaces
                  </Button>
                  <Button
                    size="sm"
                    variant={editorSettings.tabSize === 4 ? "secondary" : "ghost"}
                    onClick={() => setEditorSettings((prev) => ({ ...prev, tabSize: 4 }))}
                    className="h-7 px-3 text-xs rounded-lg font-bold"
                  >
                    4 Spaces
                  </Button>
                </div>
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Word Wrap
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Wrap lines that exceed the viewport width to prevent horizontal scrolling.
                  </p>
                </div>
                <Switch
                  checked={editorSettings.wordWrap}
                  onCheckedChange={(checked) =>
                    setEditorSettings((prev) => ({ ...prev, wordWrap: checked }))
                  }
                />
              </div>

              {/* Minimap */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Editor Minimap
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Show the high-level code outline preview on the right edge of the editor.
                  </p>
                </div>
                <Switch
                  checked={editorSettings.minimap}
                  onCheckedChange={(checked) =>
                    setEditorSettings((prev) => ({ ...prev, minimap: checked }))
                  }
                />
              </div>

              {/* Format on Save */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Auto-Save & Format
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Automatically sync changes to server and disk when editing stops.
                  </p>
                </div>
                <Switch
                  checked={editorSettings.formatOnSave}
                  onCheckedChange={(checked) =>
                    setEditorSettings((prev) => ({ ...prev, formatOnSave: checked }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CODE EXECUTION ENGINE */}
          <TabsContent value="runner" className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" /> Multi-Language Cloud Execution Engine
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select how code snippets and standalone DSA solutions (Java, Python, C++, Go, Rust) are compiled.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setRunnerSettings((prev) => ({ ...prev, engine: "auto" }))}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    runnerSettings.engine === "auto"
                      ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      Auto Dual Engine
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">Recommended</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Wandbox fast compiler with automatic live fallback to Piston engine.
                  </p>
                </div>

                <div
                  onClick={() => setRunnerSettings((prev) => ({ ...prev, engine: "wandbox" }))}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    runnerSettings.engine === "wandbox"
                      ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40"
                  }`}
                >
                  <span className="font-bold text-sm text-zinc-900 dark:text-white block mb-2">
                    Wandbox Compiler
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Ultra low-latency cloud compiler for GCC, OpenJDK, Python 3, and Clang.
                  </p>
                </div>

                <div
                  onClick={() => setRunnerSettings((prev) => ({ ...prev, engine: "piston" }))}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    runnerSettings.engine === "piston"
                      ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40"
                  }`}
                >
                  <span className="font-bold text-sm text-zinc-900 dark:text-white block mb-2">
                    Piston Container
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Containerized code execution environment supporting 40+ runtimes.
                  </p>
                </div>
              </div>

              {/* Default Language Picker */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Default Custom Canvas Language Starter
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["java", "python", "cpp", "javascript", "blank"].map((lang) => (
                    <Button
                      key={lang}
                      size="sm"
                      variant={runnerSettings.defaultLanguage === lang ? "default" : "outline"}
                      onClick={() => setRunnerSettings((prev) => ({ ...prev, defaultLanguage: lang }))}
                      className="rounded-xl text-xs capitalize font-semibold"
                    >
                      {lang === "cpp" ? "C++ 20" : lang === "blank" ? "Clean Blank" : lang}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: AI ASSISTANT */}
          <TabsContent value="ai" className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> AI Code Copilot (Gemini 2.5)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Configure smart inline code suggestions and AI assistant behavior.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Enable Realtime AI Code Suggestions
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Provides intelligent ghost text completions inside Monaco editor as you type.
                  </p>
                </div>
                <Switch
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) =>
                    setAiSettings((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-white">
                    AI Suggestion Trigger
                  </Label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Choose between automatic suggestions on pause or manual keyboard trigger.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border">
                  <Button
                    size="sm"
                    variant={aiSettings.triggerMode === "auto" ? "secondary" : "ghost"}
                    onClick={() => setAiSettings((prev) => ({ ...prev, triggerMode: "auto" }))}
                    className="h-7 px-3 text-xs rounded-lg font-bold"
                  >
                    Automatic
                  </Button>
                  <Button
                    size="sm"
                    variant={aiSettings.triggerMode === "manual" ? "secondary" : "ghost"}
                    onClick={() => setAiSettings((prev) => ({ ...prev, triggerMode: "manual" }))}
                    className="h-7 px-3 text-xs rounded-lg font-bold"
                  >
                    Manual (Ctrl+Space)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: UI APPEARANCE */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" /> UI Theme & Mode
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select your preferred system color theme for the VibeCode dashboard and navigation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setSystemTheme("dark")}
                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    systemTheme === "dark"
                      ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-sm font-bold">Dark Mode</span>
                </div>

                <div
                  onClick={() => setSystemTheme("light")}
                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    systemTheme === "light"
                      ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-bold">Light Mode</span>
                </div>

                <div
                  onClick={() => setSystemTheme("system")}
                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    systemTheme === "system"
                      ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <Laptop className="w-6 h-6 text-zinc-400" />
                  <span className="text-sm font-bold">System Sync</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: ACCOUNT & PROFILE */}
          <TabsContent value="account" className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-md">
                  <Image
                    src={session?.user?.image || "/placeholder.svg"}
                    alt={session?.user?.name || "User Avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {session?.user?.name || "VibeCoder Developer"}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {session?.user?.email || "developer@vibecode.io"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-none text-[10px]">
                      Verified Developer
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[10px]">
                      WebContainers Online
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Workspace Diagnostics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-500">Local Cache Storage</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Synced</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-500">Security / Isolation</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">Cross-Origin Active</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
