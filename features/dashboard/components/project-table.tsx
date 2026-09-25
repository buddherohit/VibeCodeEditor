"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Project } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  Eye,
  Search,
  LayoutGrid,
  List,
  Star,
  Play,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { MarkedToggleButton } from "./toggle-star";
import ProjectCard from "./project-card";

interface ProjectTableProps {
  projects: Project[];
  onUpdateProject?: (
    id: string,
    data: { title: string; description: string }
  ) => Promise<any>;
  onDeleteProject?: (id: string) => Promise<any>;
  onDuplicateProject?: (id: string) => Promise<any>;
  onMarkasFavorite?: (id: string) => Promise<any>;
}

interface EditProjectData {
  title: string;
  description: string;
}

export default function ProjectTable({
  projects,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
  onMarkasFavorite,
}: ProjectTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editData, setEditData] = useState<EditProjectData>({
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filterOptions = ["ALL", "BLANK", "REACT", "NEXTJS", "EXPRESS", "VUE", "HONO", "ANGULAR", "STARRED"];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search matching
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter matching
      if (!matchesSearch) return false;
      if (selectedFilter === "ALL") return true;
      if (selectedFilter === "STARRED") {
        return project.Starmark?.[0]?.isMarked;
      }
      return project.template.toUpperCase() === selectedFilter;
    });
  }, [projects, searchQuery, selectedFilter]);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditData({
      title: project.title,
      description: project.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !onUpdateProject) return;

    setIsLoading(true);
    try {
      await onUpdateProject(selectedProject.id, editData);
      setEditDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !onDeleteProject) return;

    setIsLoading(true);
    try {
      await onDeleteProject(selectedProject.id);
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error("Error deleting project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    if (!onDuplicateProject) return;

    setIsLoading(true);
    try {
      await onDuplicateProject(project.id);
      toast.success("Project duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate project");
      console.error("Error duplicating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyProjectUrl = (projectId: string) => {
    const url = `${window.location.origin}/playground/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success("Project URL copied to clipboard");
  };

  const getTemplateIcon = (template: string) => {
    switch (template.toUpperCase()) {
      case "BLANK":
        return "/custom-code.svg";
      case "REACT":
        return "/react.svg";
      case "NEXTJS":
        return "/nextjs-icon.svg";
      case "EXPRESS":
        return "/expressjs-icon.svg";
      case "VUE":
        return "/vuejs-icon.svg";
      case "HONO":
        return "/hono.svg";
      case "ANGULAR":
        return "/angular-2.svg";
      default:
        return "/logo.svg";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search sandboxes by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-cyan-500"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800"
              }`}
            >
              {filter === "STARRED" ? "⭐️ Starred" : filter}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No sandboxes match your criteria
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            Try adjusting your search query or create a brand new playground to start coding.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicateProject}
            />
          ))}
        </div>
      ) : (
        /* Modern Table View */
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-950/60">
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="font-semibold text-xs text-zinc-500 uppercase">Sandbox Name</TableHead>
                <TableHead className="font-semibold text-xs text-zinc-500 uppercase">Template</TableHead>
                <TableHead className="font-semibold text-xs text-zinc-500 uppercase">Created</TableHead>
                <TableHead className="font-semibold text-xs text-zinc-500 uppercase">Owner</TableHead>
                <TableHead className="w-[80px] text-right font-semibold text-xs text-zinc-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <TableCell className="font-medium py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1.5 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                        <Image
                          src={getTemplateIcon(project.template)}
                          alt={project.template}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/playground/${project.id}`}
                          className="font-bold text-sm text-zinc-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                        >
                          {project.title}
                        </Link>
                        <span className="text-xs text-zinc-400 line-clamp-1">
                          {project.description || "In-browser WebContainer project"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                    >
                      {project.template}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
                        <Image
                          src={project.user?.image || "/placeholder.svg"}
                          alt={project.user?.name || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[100px]">
                        {project.user?.name || "User"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <MarkedToggleButton
                        markedForRevision={project.Starmark?.[0]?.isMarked}
                        id={project.id}
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/playground/${project.id}`}>
                              <Play className="h-4 w-4 mr-2 text-cyan-500" />
                              Launch Sandbox
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/playground/${project.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyProjectUrl(project.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateProject(project)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(project)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename / Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(project)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Project</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Update the project title and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">Title</Label>
              <Input
                id="title"
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="My Awesome App"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What does this project do?"
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isLoading}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateProject}
              disabled={isLoading || !editData.title.trim()}
              className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Sandbox?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500">
              Are you sure you want to delete &quot;{selectedProject?.title}&quot;? All files and WebContainer data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading} className="rounded-xl text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="rounded-xl text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
