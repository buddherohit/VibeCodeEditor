import { type NextRequest, NextResponse } from "next/server"

interface CodeSuggestionRequest {
  fileContent: string
  cursorLine: number
  cursorColumn: number
  suggestionType: string
  fileName?: string
}

interface CodeContext {
  language: string
  framework: string
  beforeContext: string
  currentLine: string
  afterContext: string
  cursorPosition: { line: number; column: number }
  isInFunction: boolean
  isInClass: boolean
  isAfterComment: boolean
  incompletePatterns: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: CodeSuggestionRequest = await request.json()
    const { fileContent, cursorLine, cursorColumn, suggestionType, fileName } = body

    // Validate input
    if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType) {
      return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
    }

    // Analyze code context
    const context = analyzeCodeContext(fileContent, cursorLine, cursorColumn, fileName)

    // Build AI prompt
    const prompt = buildPrompt(context, suggestionType)

    // Call AI service (replace with your AI service)
    const suggestion = await generateSuggestion(prompt)

    return NextResponse.json({
      suggestion,
      context,
      metadata: {
        language: context.language,
        framework: context.framework,
        position: context.cursorPosition,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Context analysis error:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}

/**
 * Analyze the code context around the cursor position
 */
function analyzeCodeContext(content: string, line: number, column: number, fileName?: string): CodeContext {
  const lines = content.split("\n")
  const currentLine = lines[line] || ""

  // Get surrounding context (10 lines before and after)
  const contextRadius = 10
  const startLine = Math.max(0, line - contextRadius)
  const endLine = Math.min(lines.length, line + contextRadius)

  const beforeContext = lines.slice(startLine, line).join("\n")
  const afterContext = lines.slice(line + 1, endLine).join("\n")

  // Detect language and framework
  const language = detectLanguage(content, fileName)
  const framework = detectFramework(content)

  // Analyze code patterns
  const isInFunction = detectInFunction(lines, line)
  const isInClass = detectInClass(lines, line)
  const isAfterComment = detectAfterComment(currentLine, column)
  const incompletePatterns = detectIncompletePatterns(currentLine, column)

  return {
    language,
    framework,
    beforeContext,
    currentLine,
    afterContext,
    cursorPosition: { line, column },
    isInFunction,
    isInClass,
    isAfterComment,
    incompletePatterns,
  }
}

/**
 * Build AI prompt based on context
 */
function buildPrompt(context: CodeContext, suggestionType: string): string {
  return `You are an expert code completion assistant. Generate a ${suggestionType} suggestion.

Language: ${context.language}
Framework: ${context.framework}

Context:
${context.beforeContext}
${context.currentLine.substring(0, context.cursorPosition.column)}|CURSOR|${context.currentLine.substring(context.cursorPosition.column)}
${context.afterContext}

Analysis:
- In Function: ${context.isInFunction}
- In Class: ${context.isInClass}
- After Comment: ${context.isAfterComment}
- Incomplete Patterns: ${context.incompletePatterns.join(", ") || "None"}

Instructions:
1. Provide only the code that should be inserted at the cursor
2. Maintain proper indentation and style
3. Follow ${context.language} best practices
4. Make the suggestion contextually appropriate

Generate suggestion:`
}

/**
 * Generate suggestion using AI service (Gemini cloud or Ollama local)
 */
async function generateSuggestion(prompt: string): Promise<string> {
  // 1. Try ExperientialLabs / Astra
  const expKey = process.env.EXPERIENTIAL_API_KEY || process.env.ASTRA_API_KEY;
  if (expKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch("https://api.experientiallabs.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${expKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        let suggestion = data.choices?.[0]?.message?.content || "";
        if (suggestion.includes("```")) {
          const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/);
          suggestion = codeMatch ? codeMatch[1].trim() : suggestion;
        }
        return suggestion.replace(/\|CURSOR\|/g, "").trim();
      }
    } catch (e) {
      // silently fallback
    }
  }

  // 2. Try Gemini API first if configured
  if (process.env.GEMINI_API_KEY) {
    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
    for (const modelName of candidateModels) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 250,
          },
        });
        let text = result.response.text();
        if (text.includes("```")) {
          const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)```/);
          text = codeMatch ? codeMatch[1].trim() : text;
        }
        if (text) {
          return text.replace(/\|CURSOR\|/g, "").trim();
        }
      } catch (e) {
        // try next model
      }
    }
  }

  // 2. Try Ollama local
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "codellama:latest",
        prompt,
        stream: false,
        options: {
          temperature: 0.4,
          max_tokens: 200,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      let suggestion = data.response || "";
      if (suggestion.includes("```")) {
        const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/);
        suggestion = codeMatch ? codeMatch[1].trim() : suggestion;
      }
      return suggestion.replace(/\|CURSOR\|/g, "").trim();
    }
  } catch (error) {
    // silently fail
  }

  return "";
}

// Helper functions for code analysis
function detectLanguage(content: string, fileName?: string): string {
  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const extMap: Record<string, string> = {
      ts: "TypeScript",
      tsx: "TypeScript",
      js: "JavaScript",
      jsx: "JavaScript",
      py: "Python",
      java: "Java",
      go: "Go",
      rs: "Rust",
      php: "PHP",
    }
    if (ext && extMap[ext]) return extMap[ext]
  }

  // Content-based detection
  if (content.includes("interface ") || content.includes(": string")) return "TypeScript"
  if (content.includes("def ") || content.includes("import ")) return "Python"
  if (content.includes("func ") || content.includes("package ")) return "Go"

  return "JavaScript"
}

function detectFramework(content: string): string {
  if (content.includes("import React") || content.includes("useState")) return "React"
  if (content.includes("import Vue") || content.includes("<template>")) return "Vue"
  if (content.includes("@angular/") || content.includes("@Component")) return "Angular"
  if (content.includes("next/") || content.includes("getServerSideProps")) return "Next.js"

  return "None"
}

function detectInFunction(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i]
    if (line?.match(/^\s*(function|def|const\s+\w+\s*=|let\s+\w+\s*=)/)) return true
    if (line?.match(/^\s*}/)) break
  }
  return false
}

function detectInClass(lines: string[], currentLine: number): boolean {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i]
    if (line?.match(/^\s*(class|interface)\s+/)) return true
  }
  return false
}

function detectAfterComment(line: string, column: number): boolean {
  const beforeCursor = line.substring(0, column)
  return /\/\/.*$/.test(beforeCursor) || /#.*$/.test(beforeCursor)
}

function detectIncompletePatterns(line: string, column: number): string[] {
  const beforeCursor = line.substring(0, column)
  const patterns: string[] = []

  if (/^\s*(if|while|for)\s*\($/.test(beforeCursor.trim())) patterns.push("conditional")
  if (/^\s*(function|def)\s*$/.test(beforeCursor.trim())) patterns.push("function")
  if (/\{\s*$/.test(beforeCursor)) patterns.push("object")
  if (/\[\s*$/.test(beforeCursor)) patterns.push("array")
  if (/=\s*$/.test(beforeCursor)) patterns.push("assignment")
  if (/\.\s*$/.test(beforeCursor)) patterns.push("method-call")

  return patterns
}

function getLastNonEmptyLine(lines: string[], currentLine: number): string {
  for (let i = currentLine - 1; i >= 0; i--) {
    const line = lines[i]
    if (line.trim() !== "") return line
  }
  return ""
}