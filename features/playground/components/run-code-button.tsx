"use client";

import React from "react";
import { Play, Loader2, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RunCodeButtonProps {
  onRun: () => void;
  isRunning: boolean;
  disabled?: boolean;
  languageName?: string;
  isWeb?: boolean;
  className?: string;
}

export const RunCodeButton: React.FC<RunCodeButtonProps> = ({
  onRun,
  isRunning,
  disabled = false,
  languageName,
  isWeb = false,
  className,
}) => {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.platform) {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  const shortcutKey = isMac ? "⌘ + ↵" : "Ctrl + Enter";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          onClick={onRun}
          disabled={disabled || isRunning}
          className={cn(
            "relative overflow-hidden font-medium text-xs transition-all duration-200 gap-1.5 shadow-sm",
            isRunning
              ? "bg-amber-600/90 hover:bg-amber-600 text-white cursor-wait"
              : isWeb
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20",
            className
          )}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : isWeb ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Preview Web</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Code</span>
            </>
          )}

          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-black/20 text-white/90 border border-white/10">
            {shortcutKey}
          </kbd>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-semibold">
          {isRunning
            ? "Executing code on Piston engine..."
            : isWeb
            ? "Preview HTML / Web Page"
            : `Execute ${languageName || "code"} (${shortcutKey})`}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Press {shortcutKey} anywhere in editor
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
