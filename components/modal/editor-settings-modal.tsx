"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Sliders, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface EditorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    theme: string;
    fontSize: number;
    wordWrap: boolean;
    minimap: boolean;
    tabSize: number;
  };
  onSaveSettings: (newSettings: {
    theme: string;
    fontSize: number;
    wordWrap: boolean;
    minimap: boolean;
    tabSize: number;
  }) => void;
}

export const EditorSettingsModal: React.FC<EditorSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [theme, setTheme] = useState(settings.theme || "modern-dark");
  const [fontSize, setFontSize] = useState(settings.fontSize || 14);
  const [wordWrap, setWordWrap] = useState(settings.wordWrap ?? true);
  const [minimap, setMinimap] = useState(settings.minimap ?? true);
  const [tabSize, setTabSize] = useState(settings.tabSize || 2);

  useEffect(() => {
    setTheme(settings.theme || "modern-dark");
    setFontSize(settings.fontSize || 14);
    setWordWrap(settings.wordWrap ?? true);
    setMinimap(settings.minimap ?? true);
    setTabSize(settings.tabSize || 2);
  }, [settings, isOpen]);

  const handleApply = () => {
    onSaveSettings({
      theme,
      fontSize,
      wordWrap,
      minimap,
      tabSize,
    });
    toast.success("Editor settings applied!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg">Editor Preferences</DialogTitle>
          </div>
          <DialogDescription>
            Customize your Monaco editor themes, fonts, and layout settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Theme Selector */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Editor Theme</Label>
              <p className="text-xs text-muted-foreground">Choose your color scheme</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern-dark">Modern Dark</SelectItem>
                <SelectItem value="vs-dark">VSCode Dark</SelectItem>
                <SelectItem value="light">VSCode Light</SelectItem>
                <SelectItem value="hc-black">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Font Size</Label>
              <p className="text-xs text-muted-foreground">Editor text size</p>
            </div>
            <Select value={String(fontSize)} onValueChange={(v) => setFontSize(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Font Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px (Compact)</SelectItem>
                <SelectItem value="14">14px (Default)</SelectItem>
                <SelectItem value="16">16px (Medium)</SelectItem>
                <SelectItem value="18">18px (Large)</SelectItem>
                <SelectItem value="20">20px (Extra Large)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Size */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Tab Size</Label>
              <p className="text-xs text-muted-foreground">Number of spaces per indentation</p>
            </div>
            <Select value={String(tabSize)} onValueChange={(v) => setTabSize(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tab Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Word Wrap Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <Label className="text-sm font-medium">Word Wrap</Label>
              <p className="text-xs text-muted-foreground">Wrap long code lines inside viewport</p>
            </div>
            <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
          </div>

          {/* Minimap Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <Label className="text-sm font-medium">Code Minimap</Label>
              <p className="text-xs text-muted-foreground">Show code overview map on right</p>
            </div>
            <Switch checked={minimap} onCheckedChange={setMinimap} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            <Check className="h-4 w-4 mr-1.5" /> Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
