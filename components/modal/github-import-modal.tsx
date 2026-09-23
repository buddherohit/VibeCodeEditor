"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Github, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlaygroundFromGithub } from "@/features/playground/actions";
import type { TemplateFolder, TemplateFile } from "@/features/playground/libs/path-to-json";

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubImportModal: React.FC<GithubImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    // Parse owner and repo name
    let cleanUrl = repoUrl.trim().replace(/^https?:\/\/github\.com\//i, "");
    cleanUrl = cleanUrl.replace(/\.git$/i, "").replace(/\/$/, "");
    const parts = cleanUrl.split("/");

    if (parts.length < 2) {
      setError("Invalid GitHub format. Use format: owner/repo or https://github.com/owner/repo");
      return;
    }

    const [owner, repo] = parts;

    try {
      setIsLoading(true);
      setError(null);
      setStatusMessage("Fetching repository information...");

      // 1. Get default branch
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoInfoRes.ok) {
        throw new Error(`Repository not found or private (Status: ${repoInfoRes.status})`);
      }
      const repoInfo = await repoInfoRes.json();
      const defaultBranch = repoInfo.default_branch || "main";

      setStatusMessage(`Reading file tree from branch "${defaultBranch}"...`);

      // 2. Fetch recursive git tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );
      if (!treeRes.ok) {
        throw new Error("Failed to fetch repository file tree");
      }
      const treeData = await treeRes.json();

      if (!treeData.tree || !Array.isArray(treeData.tree)) {
        throw new Error("No files found in repository");
      }

      // Filter and limit files (ignore node_modules, .git, lock files, images/binaries)
      const ignoredFolders = ["node_modules", ".git", ".next", "dist", "build", ".vscode"];
      const filteredItems = treeData.tree
        .filter((item: any) => {
          if (item.type !== "blob") return false;
          if (ignoredFolders.some((f) => item.path.includes(`${f}/`))) return false;
          if (item.size && item.size > 1024 * 1024) return false; // skip files > 1MB
          return true;
        })
        .slice(0, 50); // limit to first 50 files for speed

      setStatusMessage(`Downloading ${filteredItems.length} files...`);

      // 3. Fetch file contents
      const filesMap = new Map<string, string>();
      for (const item of filteredItems) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`;
          const fileRes = await fetch(rawUrl);
          if (fileRes.ok) {
            const content = await fileRes.text();
            filesMap.set(item.path, content);
          }
        } catch (e) {
          console.warn(`Failed to fetch file ${item.path}`);
        }
      }

      // 4. Build TemplateFolder tree structure
      const rootFolder: TemplateFolder = {
        folderName: repo,
        items: [],
      };

      const getOrCreateSubfolder = (current: TemplateFolder, pathSegments: string[]): TemplateFolder => {
        if (pathSegments.length === 0) return current;
        const segment = pathSegments[0];
        let sub = current.items.find(
          (it): it is TemplateFolder => "folderName" in it && it.folderName === segment
        );
        if (!sub) {
          sub = {
            folderName: segment,
            items: [],
          };
          current.items.push(sub);
        }
        return getOrCreateSubfolder(sub, pathSegments.slice(1));
      };

      for (const [filePath, content] of filesMap.entries()) {
        const segments = filePath.split("/");
        const fileNameWithExt = segments[segments.length - 1];
        const dirSegments = segments.slice(0, -1);

        const targetFolder = getOrCreateSubfolder(rootFolder, dirSegments);
        const lastDot = fileNameWithExt.lastIndexOf(".");
        const filename = lastDot !== -1 ? fileNameWithExt.slice(0, lastDot) : fileNameWithExt;
        const fileExtension = lastDot !== -1 ? fileNameWithExt.slice(lastDot + 1) : "";

        targetFolder.items.push({
          filename,
          fileExtension,
          content,
        });
      }

      // Determine template type
      let templateType: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR" = "REACT";
      const pkgContent = filesMap.get("package.json") || "";
      if (pkgContent.includes("next")) templateType = "NEXTJS";
      else if (pkgContent.includes("vue")) templateType = "VUE";
      else if (pkgContent.includes("express")) templateType = "EXPRESS";
      else if (pkgContent.includes("hono")) templateType = "HONO";
      else if (pkgContent.includes("@angular")) templateType = "ANGULAR";

      setStatusMessage("Creating playground...");

      const newPlayground = await createPlaygroundFromGithub({
        title: repo,
        description: repoInfo.description || `Imported from ${owner}/${repo}`,
        template: templateType,
        templateData: rootFolder,
      });

      toast.success(`Repository ${repo} imported successfully!`);
      onClose();
      if (newPlayground?.id) {
        router.push(`/playground/${newPlayground.id}`);
      }
    } catch (err: any) {
      console.error("GitHub import error:", err);
      setError(err.message || "Failed to import GitHub repository");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Github className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">Import from GitHub</DialogTitle>
          </div>
          <DialogDescription>
            Enter any public GitHub repository to clone and open it in the Web IDE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL or Slug</Label>
            <Input
              id="repo-url"
              placeholder="e.g. facebook/react or https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              className="font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && statusMessage && (
            <div className="p-3 rounded-md bg-muted text-xs text-muted-foreground flex items-center gap-2 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !repoUrl.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Import Repository
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
