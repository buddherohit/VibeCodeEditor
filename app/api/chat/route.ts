import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface EnhancePromptRequest {
  prompt: string;
  context?: {
    fileName?: string;
    language?: string;
    codeContent?: string;
  };
}

async function generateWithGemini(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are an expert AI coding assistant built into VibeCode Web IDE. You help developers write clean, robust code, debug issues, explain concepts, and provide best practices. Format all code cleanly in markdown with language tags.",
    });

    const formattedHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1]?.content || "Help me with this code";

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.warn("Gemini API call failed, attempting fallback:", error);
    return null;
  }
}

async function generateWithOllama(messages: ChatMessage[]): Promise<string | null> {
  const systemPrompt = `You are an expert AI coding assistant. You help developers with code explanations, debugging, best practices, and writing clean code. Always format code using markdown blocks with language tags.`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];
  const prompt = fullMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "codellama:latest",
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 1000,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    return data.response?.trim() || null;
  } catch (error) {
    clearTimeout(timeoutId);
    return null;
  }
}

async function generateWithExperiential(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.EXPERIENTIAL_API_KEY || process.env.ASTRA_API_KEY;
  if (!apiKey) return null;

  const modelsToTry = ["deepseek-v4-flash", "gpt-5.6-luna", "seed-2.0-code", "gpt-4o-mini"];
  const systemPrompt = "You are an expert AI coding assistant built into VibeCode Web IDE. You help developers write clean, robust code, debug issues, explain concepts, and provide best practices. Format all code cleanly in markdown with language tags.";

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://api.experientiallabs.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply.trim();
      }
    } catch (error) {
      // try next model or fallback
    }
  }
  return null;
}

async function generateAIResponse(messages: ChatMessage[]) {
  // 1. Try ExperientialLabs / Astra API key if present
  const expResponse = await generateWithExperiential(messages);
  if (expResponse) return expResponse;

  // 2. Try Gemini if API key is present
  const geminiResponse = await generateWithGemini(messages);
  if (geminiResponse) return geminiResponse;

  // 3. Try Ollama local model
  const ollamaResponse = await generateWithOllama(messages);
  if (ollamaResponse) return ollamaResponse;

  // 4. Fallback smart assistant response
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  if (lastMsg.includes("react") || lastMsg.includes("component")) {
    return "Here is a clean React component structure for your project:\n\n```tsx\nimport React, { useState } from 'react';\n\nexport const MyComponent: React.FC = () => {\n  const [state, setState] = useState(false);\n  return (\n    <div className=\"p-4 rounded-lg bg-card border border-border\">\n      <h2 className=\"text-lg font-bold\">Interactive Component</h2>\n      <button onClick={() => setState(!state)} className=\"mt-2 px-3 py-1 bg-primary text-white rounded\">\n        Toggle State: {state ? 'ON' : 'OFF'}\n      </button>\n    </div>\n  );\n};\n```\n\n*(Tip: Add `GEMINI_API_KEY` to `.env.local` to enable full cloud LLM streaming capabilities!)*";
  }

  return "I am your VibeCode AI assistant! 🚀\n\nTo enable full real-time cloud AI power:\n1. Add `GEMINI_API_KEY=your_key` in `.env.local` (100% Free at https://aistudio.google.com/app/apikey), OR\n2. Add `EXPERIENTIAL_API_KEY` in `.env.local`, OR\n3. Run Ollama locally via `ollama run codellama`.\n\nHow can I help you build today?";
}

async function enhancePrompt(request: EnhancePromptRequest) {
  const prompt = request.prompt;
  if (!prompt) return "";

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `Enhance this coding prompt to be precise, clear, and include edge cases and syntax best practices. Return only the enhanced prompt text:\n\n"${prompt}"`
      );
      return result.response.text().trim();
    } catch (e) {
      console.warn("Prompt enhancement with Gemini failed:", e);
    }
  }

  return `Please write complete, production-grade code for: ${prompt}. Include TypeScript types, error handling, and modern best practices.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Handle prompt enhancement
    if (body.action === "enhance") {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest)
      return NextResponse.json({ enhancedPrompt })
    }

    // Handle regular chat
    const { message, history } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg: any) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role),
        )
      : []

    const recentHistory = validHistory.slice(-10)
    const messages: ChatMessage[] = [...recentHistory, { role: "user", content: message }]

    const aiResponse = await generateAIResponse(messages)

    if (!aiResponse) {
      throw new Error("Empty response from AI model")
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in AI chat route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  })
}
