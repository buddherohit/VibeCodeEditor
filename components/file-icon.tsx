"use client";

import React from "react";
import {
  FileText,
  FileCode,
  FileJson,
  FileCode2,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  FileCog,
  Database,
  Terminal,
  FileKey,
  Flame,
  Globe,
  FileType,
  Sparkles,
  FileSpreadsheet,
  FileArchive,
  Music,
  Video,
  FileQuestion,
  Layers,
  Cpu,
  Coffee,
  Code2,
  Box
} from "lucide-react";

interface FileIconProps {
  filename: string;
  fileExtension?: string;
  className?: string;
  size?: number;
}

interface FolderIconProps {
  folderName: string;
  isOpen?: boolean;
  className?: string;
  size?: number;
}

/**
 * Returns a VS Code style file icon / badge based on filename and extension
 */
export function FileIcon({
  filename,
  fileExtension = "",
  className = "w-4 h-4",
  size = 16,
}: FileIconProps) {
  const ext = (fileExtension || filename.split(".").pop() || "")
    .toLowerCase()
    .replace(/^\./, "");
  const fullName = filename.toLowerCase();

  // 1. Special Exact Filenames
  if (fullName === "package.json") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0 select-none">
        npm
      </span>
    );
  }

  if (fullName === "package-lock.json" || fullName === "pnpm-lock.yaml" || fullName === "yarn.lock" || fullName === "bun.lockb") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0 select-none">
        lock
      </span>
    );
  }

  if (fullName.startsWith(".env")) {
    return <FileKey className={`text-amber-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  if (fullName === "tsconfig.json" || fullName === "jsconfig.json") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 shrink-0 select-none">
        TS
      </span>
    );
  }

  if (fullName === ".gitignore" || fullName === ".gitattributes") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-orange-500/15 text-orange-500 border border-orange-500/30 shrink-0 select-none">
        git
      </span>
    );
  }

  if (fullName.includes("dockerfile") || fullName.startsWith("docker-compose")) {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 select-none">
        🐳
      </span>
    );
  }

  if (fullName.includes("readme") || ext === "md" || ext === "mdx") {
    return <FileText className={`text-sky-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // 2. Web Frontend Languages
  // HTML
  if (ext === "html" || ext === "htm") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-orange-600/20 text-orange-500 border border-orange-500/30 shrink-0 select-none">
        &lt;&gt;
      </span>
    );
  }

  // CSS / SCSS / SASS / LESS
  if (ext === "css") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 select-none">
        #
      </span>
    );
  }
  if (ext === "scss" || ext === "sass" || ext === "less") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 shrink-0 select-none">
        💅
      </span>
    );
  }

  // TypeScript / TSX
  if (ext === "ts") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-500/30 shrink-0 select-none">
        TS
      </span>
    );
  }
  if (ext === "tsx") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 shrink-0 select-none">
        ⚛
      </span>
    );
  }

  // JavaScript / JSX
  if (ext === "js" || ext === "mjs" || ext === "cjs") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 shrink-0 select-none">
        JS
      </span>
    );
  }
  if (ext === "jsx") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 border border-yellow-500/30 shrink-0 select-none">
        ⚛
      </span>
    );
  }

  // Vue / Svelte / Astro
  if (ext === "vue") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0 select-none">
        V
      </span>
    );
  }
  if (ext === "svelte") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-orange-500/20 text-orange-500 border border-orange-500/30 shrink-0 select-none">
        S
      </span>
    );
  }
  if (ext === "astro") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0 select-none">
        🚀
      </span>
    );
  }

  // 3. Programming Languages (Python, C/C++, Java, Go, Rust, etc.)
  // Python
  if (ext === "py" || ext === "pyw" || ext === "ipynb") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shrink-0 select-none">
        🐍
      </span>
    );
  }

  // C & C++
  if (ext === "c" || ext === "h") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 select-none">
        C
      </span>
    );
  }
  if (ext === "cpp" || ext === "cc" || ext === "cxx" || ext === "hpp" || ext === "hxx") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-sky-600/20 text-sky-400 border border-sky-500/30 shrink-0 select-none">
        C++
      </span>
    );
  }

  // C#
  if (ext === "cs" || ext === "csx") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0 select-none">
        C#
      </span>
    );
  }

  // Java & Kotlin
  if (ext === "java" || ext === "class" || ext === "jar") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 shrink-0 select-none">
        ☕
      </span>
    );
  }
  if (ext === "kt" || ext === "kts") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-violet-600/20 text-violet-400 border border-violet-500/30 shrink-0 select-none">
        KT
      </span>
    );
  }

  // Go
  if (ext === "go") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shrink-0 select-none">
        GO
      </span>
    );
  }

  // Rust
  if (ext === "rs") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30 shrink-0 select-none">
        🦀
      </span>
    );
  }

  // PHP
  if (ext === "php" || ext === "phtml") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 select-none">
        PHP
      </span>
    );
  }

  // Ruby
  if (ext === "rb" || ext === "erb" || fullName === "gemfile") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-red-600/20 text-red-400 border border-red-500/30 shrink-0 select-none">
        💎
      </span>
    );
  }

  // Swift
  if (ext === "swift") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0 select-none">
        🦅
      </span>
    );
  }

  // Dart
  if (ext === "dart") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0 select-none">
        🎯
      </span>
    );
  }

  // Lua / R
  if (ext === "lua") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 select-none">
        🌙
      </span>
    );
  }
  if (ext === "r" || ext === "rmd") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 select-none">
        R
      </span>
    );
  }

  // Shell / Scripting
  if (["sh", "bash", "zsh", "fish", "bat", "cmd", "ps1"].includes(ext)) {
    return <Terminal className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Database / SQL / Prisma / GraphQL
  if (ext === "prisma" || ext === "sql") {
    return <Database className={`text-teal-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (ext === "graphql" || ext === "gql") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[8px] w-4 h-4 rounded bg-pink-600/20 text-pink-400 border border-pink-500/30 shrink-0 select-none">
        GQL
      </span>
    );
  }

  // JSON & Configs
  if (["json", "json5", "jsonc"].includes(ext)) {
    return <FileJson className={`text-yellow-500 dark:text-yellow-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (["yml", "yaml", "toml", "xml", "ini", "conf"].includes(ext)) {
    return <FileCog className={`text-indigo-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Images & Media
  if (["svg", "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "avif"].includes(ext)) {
    return <ImageIcon className={`text-purple-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) {
    return <Music className={`text-pink-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (["mp4", "webm", "mkv", "avi", "mov"].includes(ext)) {
    return <Video className={`text-rose-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Data & Archives
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) {
    return <FileSpreadsheet className={`text-emerald-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
    return <FileArchive className={`text-amber-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  if (ext === "txt" || ext === "log") {
    return <FileText className={`text-zinc-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Default File Icon
  return <FileCode2 className={`text-zinc-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
}

/**
 * Returns a VS Code style folder icon based on folder name and open state
 */
export function FolderIcon({
  folderName,
  isOpen = false,
  className = "w-4 h-4",
  size = 16,
}: FolderIconProps) {
  const name = folderName.toLowerCase();

  // Special folders colors
  let colorClass = "text-amber-500 dark:text-amber-400"; // default yellow

  if (name === "src" || name === "source") {
    colorClass = "text-cyan-500 dark:text-cyan-400";
  } else if (name === "public" || name === "assets" || name === "static") {
    colorClass = "text-emerald-500 dark:text-emerald-400";
  } else if (name === "app" || name === "pages" || name === "routes") {
    colorClass = "text-purple-500 dark:text-purple-400";
  } else if (name === "components" || name === "ui") {
    colorClass = "text-blue-500 dark:text-blue-400";
  } else if (name === "node_modules") {
    colorClass = "text-zinc-500";
  } else if (name === "api" || name === "server") {
    colorClass = "text-teal-500 dark:text-teal-400";
  } else if (name === "hooks" || name === "utils" || name === "lib") {
    colorClass = "text-orange-500 dark:text-orange-400";
  } else if (name === ".git" || name === ".github") {
    colorClass = "text-orange-600 dark:text-orange-500";
  }

  if (isOpen) {
    return (
      <FolderOpen
        className={`${colorClass} shrink-0 transition-colors ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <Folder
      className={`${colorClass} shrink-0 transition-colors ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
