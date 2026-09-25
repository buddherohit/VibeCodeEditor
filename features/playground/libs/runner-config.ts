export interface LanguageConfig {
  id: string;
  name: string;
  pistonRuntime: string;
  wandboxCompiler?: string;
  version: string;
  aliases: string[];
  extensions: string[];
  defaultFileName: string;
  monacoLanguage: string;
  boilerplate: string;
  isCompiled?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: "python",
    name: "Python 3",
    pistonRuntime: "python",
    wandboxCompiler: "cpython-head",
    version: "3.12.7",
    aliases: ["py", "python3", "python"],
    extensions: ["py"],
    defaultFileName: "main.py",
    monacoLanguage: "python",
    boilerplate: `# Python 3
def main():
    name = "VibeCode"
    print(f"Hello, {name}!")
    for i in range(1, 4):
        print(f"Count: {i}")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: "javascript",
    name: "JavaScript (Node.js)",
    pistonRuntime: "javascript",
    wandboxCompiler: "nodejs-20.17.0",
    version: "20.17.0",
    aliases: ["js", "node", "javascript"],
    extensions: ["js", "mjs", "cjs"],
    defaultFileName: "index.js",
    monacoLanguage: "javascript",
    boilerplate: `// JavaScript (Node.js)
console.log("Hello from VibeCode Runner!");

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    pistonRuntime: "typescript",
    wandboxCompiler: "typescript-5.6.2",
    version: "5.6.2",
    aliases: ["ts", "typescript"],
    extensions: ["ts"],
    defaultFileName: "index.ts",
    monacoLanguage: "typescript",
    boilerplate: `// TypeScript
interface User {
  id: number;
  name: string;
  role: string;
}

const user: User = {
  id: 1,
  name: "VibeCoder",
  role: "Developer",
};

console.log(\`User \${user.name} (\${user.role}) initialized!\`);
`,
  },
  {
    id: "cpp",
    name: "C++ (GCC)",
    pistonRuntime: "c++",
    wandboxCompiler: "gcc-head",
    version: "13.2.0",
    aliases: ["cpp", "c++", "cc", "cxx"],
    extensions: ["cpp", "cc", "cxx", "hpp"],
    defaultFileName: "main.cpp",
    monacoLanguage: "cpp",
    isCompiled: true,
    boilerplate: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Hello, C++ World!" << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}
`,
  },
  {
    id: "c",
    name: "C (GCC)",
    pistonRuntime: "c",
    wandboxCompiler: "gcc-head-c",
    version: "13.2.0",
    aliases: ["c"],
    extensions: ["c", "h"],
    defaultFileName: "main.c",
    monacoLanguage: "c",
    isCompiled: true,
    boilerplate: `#include <stdio.h>

int main() {
    printf("Hello from C programming!\\n");
    return 0;
}
`,
  },
  {
    id: "java",
    name: "Java (OpenJDK)",
    pistonRuntime: "java",
    wandboxCompiler: "openjdk-jdk-22+36",
    version: "22.0.0",
    aliases: ["java"],
    extensions: ["java"],
    defaultFileName: "Main.java",
    monacoLanguage: "java",
    isCompiled: true,
    boilerplate: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java from VibeCode!");
        for (int i = 1; i <= 3; i++) {
            System.out.println("Iteration: " + i);
        }
    }
}
`,
  },
  {
    id: "rust",
    name: "Rust",
    pistonRuntime: "rust",
    wandboxCompiler: "rust-1.82.0",
    version: "1.82.0",
    aliases: ["rs", "rust"],
    extensions: ["rs"],
    defaultFileName: "main.rs",
    monacoLanguage: "rust",
    isCompiled: true,
    boilerplate: `fn main() {
    println!("Hello, Rustacean!");
    let numbers = vec![10, 20, 30];
    let sum: i32 = numbers.iter().sum();
    println!("Total sum: {}", sum);
}
`,
  },
  {
    id: "go",
    name: "Go",
    pistonRuntime: "go",
    wandboxCompiler: "go-1.23.2",
    version: "1.23.2",
    aliases: ["go", "golang"],
    extensions: ["go"],
    defaultFileName: "main.go",
    monacoLanguage: "go",
    isCompiled: true,
    boilerplate: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go World!")
    
    fruits := []string{"Apple", "Banana", "Cherry"}
    for i, fruit := range fruits {
        fmt.Printf("%d: %s\\n", i+1, fruit)
    }
}
`,
  },
  {
    id: "php",
    name: "PHP",
    pistonRuntime: "php",
    wandboxCompiler: "php-8.3.12",
    version: "8.3.12",
    aliases: ["php"],
    extensions: ["php"],
    defaultFileName: "index.php",
    monacoLanguage: "php",
    boilerplate: `<?php
echo "Hello from PHP " . phpversion() . "\\n";

$data = ["framework" => "Next.js", "editor" => "VibeCode"];
foreach ($data as $key => $value) {
    echo "$key: $value\\n";
}
`,
  },
  {
    id: "ruby",
    name: "Ruby",
    pistonRuntime: "ruby",
    wandboxCompiler: "ruby-4.0.2",
    version: "3.3.5",
    aliases: ["rb", "ruby"],
    extensions: ["rb"],
    defaultFileName: "main.rb",
    monacoLanguage: "ruby",
    boilerplate: `# Ruby
puts "Hello from Ruby #{RUBY_VERSION}!"

[1, 2, 3, 4].each do |n|
  puts "Square of #{n} is #{n**2}"
end
`,
  },
  {
    id: "csharp",
    name: "C# (Mono)",
    pistonRuntime: "csharp",
    wandboxCompiler: "mono-6.12.0.199",
    version: "6.12.0",
    aliases: ["cs", "csharp", "dotnet"],
    extensions: ["cs"],
    defaultFileName: "Program.cs",
    monacoLanguage: "csharp",
    isCompiled: true,
    boilerplate: `using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Hello from C#!");
    }
}
`,
  },
  {
    id: "bash",
    name: "Bash / Shell",
    pistonRuntime: "bash",
    wandboxCompiler: "bash",
    version: "5.2.0",
    aliases: ["sh", "bash", "shell"],
    extensions: ["sh", "bash"],
    defaultFileName: "script.sh",
    monacoLanguage: "shell",
    boilerplate: `#!/bin/bash
echo "Hello from Bash shell!"
echo "Current Date: $(date)"
echo "Environment: VibeCode Terminal"
`,
  },
];

/**
 * Check if an extension is a web file (HTML/CSS)
 */
export const isWebFile = (fileExtension: string): boolean => {
  const ext = fileExtension.toLowerCase().replace(/^\./, "");
  return ["html", "htm", "css", "svg"].includes(ext);
};

/**
 * Get the language configuration for a given extension or language identifier
 */
export const getLanguageConfig = (extensionOrLang?: string): LanguageConfig | null => {
  if (!extensionOrLang) return null;
  const normalized = extensionOrLang.toLowerCase().replace(/^\./, "");

  return (
    SUPPORTED_LANGUAGES.find(
      (lang) =>
        lang.id === normalized ||
        lang.pistonRuntime === normalized ||
        lang.aliases.includes(normalized) ||
        lang.extensions.includes(normalized)
    ) || null
  );
};

/**
 * Check if the active file extension is supported by the online runner
 */
export const isExecutableFile = (fileExtension?: string): boolean => {
  if (!fileExtension) return false;
  return getLanguageConfig(fileExtension) !== null;
};
