"use client";

import React, { useState } from "react";
import TemplateSelectionModal from "@/components/modal/template-selector-modal";
import { Button } from "@/components/ui/button";
import { createPlayground } from "@/features/playground/actions";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR" | "BLANK";
    description?: string;
  }) => {
    try {
      const res = await createPlayground(data);
      toast.success("Playground created successfully!");
      setIsModalOpen(false);
      router.push(`/playground/${res?.id}`);
    } catch (err: any) {
      toast.error("Failed to create playground");
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative p-6 sm:p-7 flex flex-row justify-between items-center rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-white via-zinc-50/50 to-purple-50/20 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-purple-950/20 cursor-pointer overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-purple-500/50 hover:shadow-[0_12px_30px_rgba(168,85,247,0.15)] shadow-sm"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

        <div className="relative z-10 flex flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300 shrink-0">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                Create New Sandbox
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Instant
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px] leading-relaxed">
              Launch Custom Canvas, React, Next.js, Express, Vue, or Angular.
            </p>
            <span className="mt-3 inline-flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              Choose Template <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>

        <div className="hidden sm:block relative w-24 h-24 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
          <Image
            src="/add-new.svg"
            alt="Create Sandbox"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <TemplateSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AddNewButton;
