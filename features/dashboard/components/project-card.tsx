"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Code2,
  ExternalLink,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Edit3,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarkedToggleButton } from "./toggle-star";
import { toast } from "sonner";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onDuplicate,
}: ProjectCardProps) {
  const createdAtFormatted = formatDistanceToNow(new Date(project.createdAt), {
    addSuffix: true,
  });

  const getTemplateConfig = (template: string) => {
    switch (template.toUpperCase()) {
      case "REACT":
        return {
          icon: "/react.svg",
          label: "React 19",
          badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
          glowClass: "from-cyan-500/15 to-blue-500/5",
        };
      case "NEXTJS":
        return {
          icon: "/nextjs-icon.svg",
          label: "Next.js",
          badgeClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
          glowClass: "from-zinc-500/15 to-zinc-700/5",
        };
      case "EXPRESS":
        return {
          icon: "/expressjs-icon.svg",
          label: "Express API",
          badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          glowClass: "from-emerald-500/15 to-teal-500/5",
        };
      case "VUE":
        return {
          icon: "/vuejs-icon.svg",
          label: "Vue 3",
          badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
          glowClass: "from-green-500/15 to-emerald-500/5",
        };
      case "HONO":
        return {
          icon: "/hono.svg",
          label: "Hono Node",
          badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
          glowClass: "from-orange-500/15 to-amber-500/5",
        };
      case "ANGULAR":
        return {
          icon: "/angular-2.svg",
          label: "Angular 18",
          badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          glowClass: "from-rose-500/15 to-pink-500/5",
        };
      default:
        return {
          icon: "/logo.svg",
          label: template,
          badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
          glowClass: "from-purple-500/15 to-cyan-500/5",
        };
    }
  };

  const config = getTemplateConfig(project.template);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/playground/${project.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Sandbox URL copied to clipboard!");
  };

  return (
    <div className="group relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl p-5 shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Subtle top glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${config.glowClass} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`}
      />

      <div className="relative z-10">
        {/* Card Header: Icon + Title + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 p-2 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <Image
                src={config.icon}
                alt={project.template}
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <Link
                href={`/playground/${project.id}`}
                className="font-bold text-base text-zinc-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors line-clamp-1"
              >
                {project.title}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${config.badgeClass}`}
                >
                  {config.label}
                </Badge>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {createdAtFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <MarkedToggleButton
              markedForRevision={project.Starmark?.[0]?.isMarked}
              id={project.id}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/playground/${project.id}`}>
                    <Play className="h-4 w-4 mr-2 text-cyan-500" />
                    Open Sandbox
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/playground/${project.id}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(project)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename / Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed min-h-[32px]">
          {project.description || "In-browser WebContainer playground project."}
        </p>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 relative">
            <Image
              src={project.user?.image || "/placeholder.svg"}
              alt={project.user?.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[100px]">
            {project.user?.name || "Developer"}
          </span>
        </div>

        <Link href={`/playground/${project.id}`}>
          <Button
            size="sm"
            className="h-7 px-3 rounded-lg text-xs bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors font-medium shadow-sm flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            Launch
          </Button>
        </Link>
      </div>
    </div>
  );
}
