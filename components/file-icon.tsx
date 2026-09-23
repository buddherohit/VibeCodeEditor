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
  Sparkles
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
 * Returns a VS Code style file icon based on filename and extension
 */
export function FileIcon({
  filename,
  fileExtension = "",
  className = "w-4 h-4",
  size = 16,
}: FileIconProps) {
  const ext = fileExtension.toLowerCase().replace(/^\./, "") ||
    filename.split(".").pop()?.toLowerCase() || "";
  const fullName = filename.toLowerCase();

  // Special files
  if (fullName === "package.json") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0 select-none">
        npm
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

  if (fullName === ".gitignore") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-orange-500/15 text-orange-500 border border-orange-500/30 shrink-0 select-none">
        git
      </span>
    );
  }

  if (fullName.includes("readme") || ext === "md" || ext === "mdx") {
    return <FileText className={`text-sky-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
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

  // HTML / CSS / SCSS
  if (ext === "html" || ext === "htm") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-orange-600/20 text-orange-500 border border-orange-500/30 shrink-0 select-none">
        &lt;&gt;
      </span>
    );
  }

  if (ext === "css" || ext === "scss" || ext === "sass" || ext === "less") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 select-none">
        #
      </span>
    );
  }

  // JSON
  if (ext === "json") {
    return <FileJson className={`text-yellow-500 dark:text-yellow-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Images
  if (["svg", "png", "jpg", "jpeg", "gif", "webp", "ico"].includes(ext)) {
    return <ImageIcon className={`text-purple-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Vue
  if (ext === "vue") {
    return (
      <span className="inline-flex items-center justify-center font-bold text-[9px] w-4 h-4 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shrink-0 select-none">
        V
      </span>
    );
  }

  // Prisma
  if (ext === "prisma" || ext === "sql") {
    return <Database className={`text-teal-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  // Shell / Config
  if (["sh", "bash", "zsh"].includes(ext)) {
    return <Terminal className={`text-emerald-500 shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }

  if (["yml", "yaml", "toml", "xml"].includes(ext)) {
    return <FileCog className={`text-indigo-400 shrink-0 ${className}`} style={{ width: size, height: size }} />;
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
