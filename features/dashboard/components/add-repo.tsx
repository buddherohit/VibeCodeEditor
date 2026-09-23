"use client";

import React, { useState } from "react";
import { Github, FolderGit2, ArrowRight, GitBranch } from "lucide-react";
import Image from "next/image";
import { GithubImportModal } from "@/components/modal/github-import-modal";

const AddRepo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative p-6 sm:p-7 flex flex-row justify-between items-center rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white via-zinc-50/50 to-cyan-50/20 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-cyan-950/20 cursor-pointer overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/50 hover:shadow-[0_12px_30px_rgba(34,211,238,0.15)] shadow-sm"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

        <div className="relative z-10 flex flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <Github className="w-6 h-6" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                Import from GitHub
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Clone
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px] leading-relaxed">
              Open any public GitHub repository directly inside the in-browser sandbox.
            </p>
            <span className="mt-3 inline-flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
              Paste Repo URL <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div className="hidden sm:block relative w-24 h-24 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
          <Image
            src="/github.svg"
            alt="Import GitHub"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <GithubImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AddRepo;
