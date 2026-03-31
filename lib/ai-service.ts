// Unified AI Service - Support for OpenAI, Gemini, and Claude

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = "openai" | "gemini" | "claude";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  provider: AIProvider;
}

// ============================================================
// OPENAI SERVICE
// ============================================================

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY || "") {
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-4-turbo";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    const formattedMessages = systemPrompt
      ? [
          { role: "system" as const, content: systemPrompt },
          ...messages,
        ]
      : messages;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";

      return {
        content,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        provider: "openai",
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const response = await this.client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return response.data?.[0]?.url || "";
  }
}

// ============================================================
// GOOGLE GEMINI SERVICE
// ============================================================

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(
    apiKey: string = process.env.GOOGLE_GENERATIVE_AI_KEY || ""
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || "gemini-pro";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    try {
      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const userMessage = messages[messages.length - 1]?.content || "";

      const chat = model.startChat({
        history,
      });

      const result = await chat.sendMessage(userMessage);
      const content = result.response.text();

      // Note: Gemini doesn't provide detailed token counts
      // Estimate based on word count (roughly 1 token per 3 characters for English)
      const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0) + content.length;
      const estimatedTokens = Math.ceil(totalChars / 3);

      return {
        content,
        tokens: {
          prompt: Math.ceil(messages.reduce((sum, msg) => sum + msg.content.length, 0) / 3),
          completion: Math.ceil(content.length / 3),
          total: estimatedTokens,
        },
        provider: "gemini",
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

// ============================================================
// CLAUDE SERVICE (ANTHROPIC)
// ============================================================

export class ClaudeService {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string = process.env.ANTHROPIC_API_KEY || "") {
    this.client = new Anthropic({ apiKey });
    this.model = process.env.CLAUDE_MODEL || "claude-3-opus-20240229";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages,
      });

      const content =
        response.content[0]?.type === "text" ? response.content[0].text : "";

      return {
        content,
        tokens: {
          prompt: response.usage?.input_tokens || 0,
          completion: response.usage?.output_tokens || 0,
          total: (response.usage?.input_tokens || 0) +
            (response.usage?.output_tokens || 0),
        },
        provider: "claude",
      };
    } catch (error) {
      console.error("Claude API error:", error);
      throw new Error(`Claude chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

// ============================================================
// AI ROUTER - UNIFIED INTERFACE
// ============================================================

export class AIService {
  private openai: OpenAIService | null;
  private gemini: GeminiService | null;
  private claude: ClaudeService | null;
  private preferredProvider: AIProvider;

  constructor() {
    // Initialize services based on available API keys
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAIService()
      : null;
    this.gemini = process.env.GOOGLE_GENERATIVE_AI_KEY
      ? new GeminiService()
      : null;
    this.claude = process.env.ANTHROPIC_API_KEY
      ? new ClaudeService()
      : null;

    // Set preferred provider
    this.preferredProvider =
      (process.env.PREFERRED_AI_PROVIDER as AIProvider) || "openai";
  }

  async chat(
    messages: AIMessage[],
    systemPrompt?: string,
    provider?: AIProvider
  ): Promise<AIResponse> {
    const targetProvider = provider || this.preferredProvider;

    switch (targetProvider) {
      case "gemini":
        if (!this.gemini)
          throw new Error("Gemini service not configured");
        return await this.gemini.chat(messages, systemPrompt);

      case "claude":
        if (!this.claude)
          throw new Error("Claude service not configured");
        return await this.claude.chat(messages, systemPrompt);

      case "openai":
      default:
        if (!this.openai)
          throw new Error("OpenAI service not configured");
        return await this.openai.chat(messages, systemPrompt);
    }
  }

  // Fallback logic: try preferred provider, then others
  async chatWithFallback(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    const providers: AIProvider[] = [
      this.preferredProvider,
      "openai",
      "gemini",
      "claude",
    ];

    // Filter out duplicates and null providers
    const uniqueProviders = Array.from(new Set(providers));

    for (const provider of uniqueProviders) {
      try {
        return await this.chat(messages, systemPrompt, provider);
      } catch (error) {
        console.warn(`Failed with ${provider}, trying next...`, error);
        continue;
      }
    }

    throw new Error("All AI providers failed");
  }

  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];
    if (this.openai) providers.push("openai");
    if (this.gemini) providers.push("gemini");
    if (this.claude) providers.push("claude");
    return providers;
  }

  getPreferredProvider(): AIProvider {
    return this.preferredProvider;
  }
}

// Singleton instance
export const aiService = new AIService();

// ============================================================
// SYSTEM PROMPTS
// ============================================================

export const SYSTEM_PROMPTS = {
  TUTOR: `You are an expert educational tutor helping students understand complex concepts. 
    - Break down topics into simple, digestible parts
    - Use examples and analogies
    - Encourage critical thinking
    - Ask clarifying questions
    - Be patient and supportive`,

  CODE_ASSISTANT: `You are an expert programming assistant.
    - Provide clear, well-commented code
    - Explain programming concepts
    - Suggest best practices and optimizations
    - Help debug code
    - Support multiple programming languages`,

  CONTENT_CREATOR: `You are a professional content writer and educator.
    - Create engaging, clear, and informative content
    - Structure information logically
    - Use appropriate tone for educational material
    - Include examples and case studies
    - Ensure accuracy and clarity`,

  QUIZ_GENERATOR: `You are an expert quiz creator.
    - Generate challenging but fair questions
    - Create clear, unambiguous options
    - Vary question types (multiple choice, short answer)
    - Provide detailed explanations
    - Ensure questions match difficulty levels`,
};
