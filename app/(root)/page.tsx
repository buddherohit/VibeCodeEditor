"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Terminal,
  Zap,
  Cloud,
  FolderGit2,
  ArrowRight,
  Play,
  CheckCircle2,
  Layers,
  Laptop,
  Code2,
  Download,
  Sliders,
  Check,
  Cpu,
  ChevronRight,
  ExternalLink,
  Shield,
  Bot
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"react" | "next" | "node">("react");
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    react: `// VibeCode Editor - Instant React + TypeScript
import React, { useState } from 'react';
import { Sparkles, Terminal } from 'lucide-react';

export default function App() {
  const [vibing, setVibing] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-950 text-white rounded-2xl border border-cyan-500/30 shadow-2xl">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Code With Feeling ⚡
      </h1>
      <p className="mt-2 text-zinc-400">Zero lag WebContainer runtime in your browser.</p>
      <button 
        onClick={() => setVibing(!vibing)}
        className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition"
      >
        {vibing ? "✨ AI Assistant Active" : "Click to Vibe"}
      </button>
    </div>
  );
}`,
    next: `// app/api/ai-assistant/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Real-time Gemini 2.5 Flash Code Completion
  return NextResponse.json({
    status: "success",
    solution: "// Generated instantly with VibeCode AI engine",
    tokens: 420
  });
}`,
    node: `// server.js - Express API Runtime
import express from 'express';
const app = express();
const PORT = 3000;

app.get('/api/vibe', (req, res) => {
  res.json({ message: "Running inside in-browser WebContainer!", speed: "10x faster" });
});

app.listen(PORT, () => console.log(\`⚡ Server listening on port \${PORT}\`));`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const frameworks = [
    {
      name: "React 19 + TypeScript",
      icon: "/react.svg",
      desc: "Vite powered modern component runtime with fast HMR.",
      tag: "Popular",
      color: "from-cyan-500/20 to-blue-500/10",
      borderColor: "border-cyan-500/30"
    },
    {
      name: "Next.js App Router",
      icon: "/nextjs-icon.svg",
      desc: "Full-stack React framework with server actions and SSR.",
      tag: "Fullstack",
      color: "from-zinc-500/20 to-zinc-700/10",
      borderColor: "border-zinc-500/30"
    },
    {
      name: "Express.js API",
      icon: "/expressjs-icon.svg",
      desc: "Fast, unopinionated minimalist REST API backend engine.",
      tag: "Backend",
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30"
    },
    {
      name: "Vue 3 + Vite",
      icon: "/vuejs-icon.svg",
      desc: "The progressive JavaScript framework for reactive UIs.",
      tag: "Frontend",
      color: "from-green-500/20 to-emerald-500/10",
      borderColor: "border-green-500/30"
    },
    {
      name: "Hono.js Node",
      icon: "/hono.svg",
      desc: "Ultrafast web framework for the edge and Node.js.",
      tag: "Edge",
      color: "from-orange-500/20 to-amber-500/10",
      borderColor: "border-orange-500/30"
    },
    {
      name: "Angular 18",
      icon: "/angular-2.svg",
      desc: "Robust enterprise component web development platform.",
      tag: "Enterprise",
      color: "from-red-500/20 to-rose-500/10",
      borderColor: "border-red-500/30"
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-6 pb-24">
      {/* Background glowing orbs */}
      <div className="pointer-events-none absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/20 to-pink-500/20 blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-[700px] left-1/4 w-[500px] h-[350px] bg-gradient-to-br from-cyan-600/15 to-indigo-600/10 blur-[120px] rounded-full -z-10" />

      {/* Hero Section */}
      <section className="w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center text-center mt-6 sm:mt-10">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-md mb-8 hover:border-cyan-500/40 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300">
            VibeCode 2.0 with Gemini 2.5 Flash AI Engine
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </div>

        {/* Main Logo & Headline */}
        <div className="relative mb-6 flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-4 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/25 ring-2 ring-cyan-400/40">
            <Image
              src="/logo.svg"
              alt="VibeCode Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] sm:leading-[1.15]">
            Code With Feeling.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400">
              Build with AI.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mb-10">
          The full-stack in-browser IDE powered by <span className="text-zinc-900 dark:text-zinc-100 font-semibold">WebContainers</span>, real-time <span className="text-cyan-500 dark:text-cyan-400 font-semibold">Gemini 2.5 Flash</span> coding assistant, live multi-port preview, and instant GitHub repo importing.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold shadow-xl shadow-cyan-500/20 transition-all duration-200 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Launch Playground
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 font-semibold text-zinc-800 dark:text-zinc-200 transition-all duration-200"
            >
              <FolderGit2 className="w-4 h-4 mr-2 text-cyan-500" />
              Import GitHub Repo
            </Button>
          </Link>
        </div>

        {/* 3D Hero Visual Banner */}
        <div className="mt-12 relative w-full max-w-4xl group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 opacity-30 blur-2xl group-hover:opacity-50 transition duration-500" />
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/20 dark:border-zinc-800 shadow-2xl bg-zinc-950">
            <Image
              src="/hero.png"
              alt="VibeCode AI Studio Showcase"
              width={1200}
              height={750}
              className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.01]"
              priority
            />
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Zero Setup Required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Runs Real Node.js in Browser
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            100% Free Gemini AI Powered
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            MongoDB Atlas Auto-Save
          </span>
        </div>
      </section>

      {/* Interactive IDE Showcase Preview Card */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mt-16">
        <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <div className="ml-4 flex items-center gap-1 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-mono">
                <Laptop className="w-3 h-3 text-cyan-400 mr-1" />
                vibecode.app/playground/demo
              </div>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
              <button
                onClick={() => setActiveTab("react")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === "react"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                App.tsx
              </button>
              <button
                onClick={() => setActiveTab("next")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === "next"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                ai-assistant.ts
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === "node"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                server.js
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="text-xs text-zinc-400 hover:text-white h-7 px-2.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : "Copy"}
            </Button>
          </div>

          {/* Editor Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] bg-zinc-950">
            {/* Code Editor Panel */}
            <div className="lg:col-span-7 p-4 sm:p-6 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto border-b lg:border-b-0 lg:border-r border-zinc-800/80">
              <div className="flex items-center gap-2 mb-3 text-[11px] text-zinc-500 uppercase tracking-wider font-sans">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                Monaco Editor Engine (Live Code)
              </div>
              <pre className="text-zinc-300 leading-relaxed font-mono">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            {/* In-Browser Preview & AI Output */}
            <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-zinc-900/40">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live WebContainer Runtime
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Port :3000
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">VibeCode Live Preview</h4>
                  <p className="text-xs text-zinc-400">
                    Component rendered in real-time inside the browser without remote servers.
                  </p>
                </div>

                {/* AI Assistant Pill */}
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-cyan-950/50 border border-purple-500/30 text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    VibeCode AI Copilot
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    &quot;Optimized React 19 rendering hook generated with Gemini 2.5 Flash.&quot;
                  </p>
                </div>
              </div>

              {/* Terminal status bar */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  webcontainer@ready
                </span>
                <span className="text-zinc-400">FPS: 60 | HMR: ON</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid - Core Capabilities */}
      <section id="features" className="w-full max-w-6xl px-4 sm:px-6 mt-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Engineered for Pure{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Developer Flow
            </span>
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Everything you need to write, build, test, and ship modern web apps entirely from your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: WebContainer */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-cyan-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              WebContainer Runtime
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Run real Node.js, install npm packages, and execute dev servers in your browser with zero cloud provisioning delays.
            </p>
          </div>

          {/* Card 2: AI Code Generation */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-purple-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Gemini 2.5 Flash Copilot
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Context-aware inline code suggestions, error debugging, and conversational AI coding assistant with markdown code blocks.
            </p>
          </div>

          {/* Card 3: Cloud Auto-Sync */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-5">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              MongoDB Atlas Auto-Save
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Debounced automatic persistence guarantees your project files, directory hierarchy, and changes are never lost.
            </p>
          </div>

          {/* Card 4: GitHub Importer */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-indigo-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-5">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              1-Click GitHub Import
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Import any public GitHub repository directly into a live sandbox playground and run it with one click.
            </p>
          </div>

          {/* Card 5: Monaco Customizer */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-pink-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-pink-500/5">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 dark:bg-pink-400/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mb-5">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Custom Monaco Themes
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fine-tune font size, tab spacing, word wrap, minimap visibility, and switch between Modern Dark, VS Dark, and Light themes.
            </p>
          </div>

          {/* Card 6: ZIP Export */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md hover:border-amber-500/40 transition duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-5">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Full ZIP Export
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Export your full project folder structure as a clean ZIP archive ready for deployment or local VS Code editing.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="w-full max-w-6xl px-4 sm:px-6 mt-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Instantly With{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400">
              Modern Frameworks
            </span>
          </h2>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Choose your favorite tech stack and start coding in under 3 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {frameworks.map((fw, idx) => (
            <Link key={idx} href="/dashboard" className="group">
              <div
                className={`p-5 rounded-2xl border ${fw.borderColor} bg-gradient-to-br ${fw.color} backdrop-blur-md hover:scale-[1.02] transition-all duration-200 shadow-sm flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 relative">
                      <Image
                        src={fw.icon}
                        alt={fw.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-zinc-900/70 text-zinc-300 border border-zinc-700/60">
                      {fw.tag}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                    {fw.name}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {fw.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between text-xs font-semibold text-cyan-500 group-hover:translate-x-0.5 transition-transform">
                  <span>Create Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full max-w-5xl px-4 sm:px-6 mt-28">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-cyan-500/30 bg-gradient-to-tr from-zinc-950 via-indigo-950/60 to-zinc-950 text-center shadow-2xl shadow-cyan-500/10">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to code at the speed of thought?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Open your browser, pick a framework, and start coding immediately with the power of VibeCode Editor.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:via-indigo-400 hover:to-cyan-300 text-white font-bold shadow-lg shadow-cyan-500/25"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started for Free
                </Button>
              </Link>
              <a
                href="https://github.com/buddherohit/VibeCodeEditor"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800"
                >
                  <FolderGit2 className="w-4 h-4 mr-2" />
                  Star on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
