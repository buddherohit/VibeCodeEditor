import Link from "next/link";
import Image from "next/image";
import { Github, Heart, Terminal, Sparkles, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo & Slogan */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm">
            <Image
              src="/logo.svg"
              alt="VibeCode Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center sm:text-left">
            <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              Vibe<span className="text-cyan-500">Code</span> Editor
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Next-Gen Cloud Web IDE & AI Coding Agent
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-cyan-500 transition-colors">
            Playground
          </Link>
          <a href="#features" className="hover:text-cyan-500 transition-colors">
            Features
          </a>
          <a href="#templates" className="hover:text-cyan-500 transition-colors">
            Templates
          </a>
          <a
            href="https://github.com/buddherohit/VibeCodeEditor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-500 transition-colors flex items-center gap-1"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        {/* Developer Attribution & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span>Designed & Developed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://github.com/buddherohit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors underline decoration-cyan-500/50 underline-offset-2"
            >
              Rohit Buddhe
            </a>
          </div>
          <span className="hidden sm:inline text-zinc-400">&bull;</span>
          <span>&copy; {new Date().getFullYear()} VibeCode Editor</span>
        </div>
      </div>
    </footer>
  );
}
