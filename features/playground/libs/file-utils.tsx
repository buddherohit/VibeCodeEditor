import React from "react";
import { FileIcon } from "@/components/file-icon";

export function getFileLanguage(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase() || "";

  switch (extension) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "json":
    case "json5":
    case "jsonc":
      return "json";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "scss":
    case "sass":
    case "less":
      return "scss";
    case "md":
    case "mdx":
      return "markdown";
    case "yaml":
    case "yml":
      return "yaml";
    case "py":
    case "pyw":
      return "python";
    case "c":
    case "h":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
    case "hpp":
      return "cpp";
    case "cs":
      return "csharp";
    case "java":
      return "java";
    case "kt":
    case "kts":
      return "kotlin";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "rb":
      return "ruby";
    case "swift":
      return "swift";
    case "sql":
      return "sql";
    case "sh":
    case "bash":
    case "zsh":
      return "shell";
    case "xml":
    case "svg":
      return "xml";
    case "vue":
      return "vue";
    case "graphql":
    case "gql":
      return "graphql";
    default:
      return "plaintext";
  }
}

export function getFileIcon(filePath: string): React.ReactNode {
  const fileName = filePath.split("/").pop() || "";
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  return <FileIcon filename={fileName} fileExtension={extension} className="mr-2 shrink-0" />;
}
