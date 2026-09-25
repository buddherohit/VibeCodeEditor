"use server"
import { currentUser } from "@/features/auth/actions";
import { db } from "@/lib/db"
import { TemplateFolder } from "../libs/path-to-json";
import { revalidatePath } from "next/cache";


// Toggle marked status for a problem
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,

          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR" | "BLANK";
  description?: string;
  initialLanguage?: string;
}) => {
  const { template, title, description, initialLanguage } = data;

  const user = await currentUser();
  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    let initialTemplateData: TemplateFolder | null = null;

    if (template === "BLANK") {
      const lang = (initialLanguage || "blank").toLowerCase();
      let files: any[] = [];

      if (lang === "java") {
        files = [
          {
            filename: "Main",
            fileExtension: "java",
            content: `import java.util.*;

class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        System.out.println("Hello, VibeCode Java Runner!");
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Two Sum Result Indices: [" + result[0] + ", " + result[1] + "]");
    }
}
`,
          },
        ];
      } else if (lang === "python" || lang === "py") {
        files = [
          {
            filename: "main",
            fileExtension: "py",
            content: `# VibeCode Python Runner
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    print("Hello from Python!")
    nums = [2, 7, 11, 15]
    target = 9
    print(f"Two Sum: {two_sum(nums, target)}")
`,
          },
        ];
      } else if (lang === "cpp" || lang === "c++") {
        files = [
          {
            filename: "main",
            fileExtension: "cpp",
            content: `#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    std::cout << "Hello from C++ Runner!" << std::endl;
    std::vector<int> nums = {2, 7, 11, 15};
    auto res = twoSum(nums, 9);
    std::cout << "Two Sum: [" << res[0] << ", " << res[1] << "]" << std::endl;
    return 0;
}
`,
          },
        ];
      } else if (lang === "javascript" || lang === "js") {
        files = [
          {
            filename: "index",
            fileExtension: "js",
            content: `// JavaScript Playground
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log("Hello from JavaScript!");
console.log("Two Sum Result:", twoSum([2, 7, 11, 15], 9));
`,
          },
        ];
      } else if (lang === "html" || lang === "web") {
        files = [
          {
            filename: "index",
            fileExtension: "html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VibeCode Web Canvas</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Hello, VibeCode!</h1>
    <p>Edit HTML, CSS, and JS to see live changes.</p>
    <button id="btn">Click Me</button>
  </div>
  <script src="script.js"></script>
</body>
</html>
`,
          },
          {
            filename: "style",
            fileExtension: "css",
            content: `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.container {
  text-align: center;
  padding: 2rem;
  background: #1e293b;
  border-radius: 12px;
}
button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
button:hover {
  background: #2563eb;
}
`,
          },
          {
            filename: "script",
            fileExtension: "js",
            content: `document.getElementById('btn').addEventListener('click', () => {
  alert('Button clicked in VibeCode Web Preview!');
});
`,
          },
        ];
      } else {
        // Pure blank canvas
        files = [
          {
            filename: "main",
            fileExtension: "py",
            content: `# Write your code here\nprint("Hello from VibeCode!")\n`,
          },
        ];
      }

      initialTemplateData = {
        folderName: "Root",
        items: files,
      };
    }

    const playground = await db.playground.create({
      data: {
        title: title,
        description: description,
        template: template,
        userId: user.id,
        ...(initialTemplateData
          ? {
              templateFiles: {
                create: {
                  content: JSON.stringify(initialTemplateData),
                },
              },
            }
          : {}),
      },
    });

    return playground;
  } catch (error) {
    console.error("Error creating playground:", error);
    throw error;
  }
};

export const createPlaygroundFromGithub = async (data: {
  title: string;
  description?: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR" | "BLANK";
  templateData: TemplateFolder;
}) => {
  const { template, title, description, templateData } = data;
  const user = await currentUser();
  if (!user?.id) throw new Error("User not authenticated");

  try {
    const playground = await db.playground.create({
      data: {
        title,
        description: description || "Imported from GitHub",
        template,
        userId: user.id,
        templateFiles: {
          create: {
            content: JSON.stringify(templateData),
          },
        },
      },
    });

    revalidatePath("/dashboard");
    return playground;
  } catch (error) {
    console.error("Error creating playground from github:", error);
    throw error;
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user?.id!,
      },
      include: {
        user: true,
        Starmark: {
          where: {
            userId: user?.id!,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.error("Error fetching playgrounds for user:", error);
    return [];
  }
};

export const getPlaygroundById = async (id: string) => {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      include: {
        templateFiles: {
          select: {
            content: true,
          },
        },
      },
    });
    return playground;
  } catch (error) {
    console.error("Error fetching playground by id:", error);
    return null;
  }
};

export const SaveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId, // now allowed since playgroundId is unique
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.log("SaveUpdatedCode error:", error);
    return null;
  }
};

export const deleteProjectById = async (id:string)=>{
    try {
        await db.playground.delete({
            where:{id}
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}


export const editProjectById = async (id:string,data:{title:string , description:string})=>{
    try {
        await db.playground.update({
            where:{id},
            data:data
        })
        revalidatePath("/dashboard")
    } catch (error) {
        console.log(error)
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        // Fetch the original playground data
        const originalPlayground = await db.playground.findUnique({
            where: { id },
            include: {
                templateFiles: true, // Include related template files
            },
        });

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        // Create a new playground with the same data but a new ID
        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
                templateFiles: {
                  // @ts-ignore
                    create: originalPlayground.templateFiles.map((file) => ({
                        content: file.content,
                    })),
                },
            },
        });

        // Revalidate the dashboard path to reflect the changes
        revalidatePath("/dashboard");

        return duplicatedPlayground;
    } catch (error) {
        console.error("Error duplicating project:", error);
    }
};