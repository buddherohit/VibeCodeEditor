import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";
import ProjectTable from "@/features/dashboard/components/project-table";
import {
  getAllPlaygroundForUser,
  deleteProjectById,
  editProjectById,
  duplicateProjectById,
} from "@/features/playground/actions";
import {
  Sparkles,
  Terminal,
  Layers,
  Star,
  Zap,
  FolderGit2,
  Cpu,
  Plus
} from "lucide-react";
import Image from "next/image";

export default async function DashboardMainPage() {
  const playgrounds = await getAllPlaygroundForUser();
  const totalCount = playgrounds?.length || 0;
  const starredCount =
    playgrounds?.filter((p) => p.Starmark?.[0]?.isMarked).length || 0;

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Banner / Welcome Row */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              In-Browser WebContainers Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Developer Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your sandboxes, launch frameworks, or import GitHub repositories.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Sandboxes</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{totalCount} Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Starred</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{starredCount} Saved</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-zinc-400">AI Model</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Gemini 2.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards (Create Sandbox / Import GitHub) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-10">
        <AddNewButton />
        <AddRepo />
      </div>

      {/* Projects Section Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Your Playgrounds
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Projects List & Grid with Search and Filter */}
      <div className="w-full">
        {/* @ts-ignore */}
        <ProjectTable
          projects={playgrounds || []}
          onDeleteProject={deleteProjectById}
          onUpdateProject={editProjectById}
          onDuplicateProject={duplicateProjectById}
        />
      </div>
    </div>
  );
}
