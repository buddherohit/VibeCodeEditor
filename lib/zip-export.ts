import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { TemplateFolder, TemplateFile } from "@/features/playground/libs/path-to-json";

/**
 * Recursively adds files and folders to a JSZip instance
 */
function addFolderToZip(folder: TemplateFolder, zipFolder: JSZip) {
  if (!folder.items || !Array.isArray(folder.items)) return;

  for (const item of folder.items) {
    if ("folderName" in item) {
      // It's a directory
      const subZipFolder = zipFolder.folder(item.folderName);
      if (subZipFolder) {
        addFolderToZip(item as TemplateFolder, subZipFolder);
      }
    } else {
      // It's a file
      const file = item as TemplateFile;
      const fullFileName = file.fileExtension
        ? `${file.filename}.${file.fileExtension}`
        : file.filename;
      zipFolder.file(fullFileName, file.content || "");
    }
  }
}

/**
 * Downloads the entire TemplateFolder structure as a ZIP file
 */
export async function downloadProjectAsZip(
  templateData: TemplateFolder,
  projectName = "vibecode-project"
): Promise<void> {
  try {
    const zip = new JSZip();
    addFolderToZip(templateData, zip);

    const blob = await zip.generateAsync({ type: "blob" });
    const cleanProjectName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-") || "project";
    
    saveAs(blob, `${cleanProjectName}.zip`);
  } catch (error) {
    console.error("Error generating ZIP file:", error);
    throw error;
  }
}
