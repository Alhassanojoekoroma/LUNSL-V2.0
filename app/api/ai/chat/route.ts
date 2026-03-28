import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiService, SYSTEM_PROMPTS, AIProvider } from "@/lib/ai-service";

// POST /api/ai/chat
// Send a message to AI and get a response
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      message,
      chatHistoryId,
      topic = "general",
      provider,
      systemPrompt,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create chat history
    let chatHistory;
    if (chatHistoryId) {
      chatHistory = await prisma.chatHistory.findUnique({
        where: { id: chatHistoryId },
        include: { messages: true },
      });

      if (!chatHistory || chatHistory.userId !== user.id) {
        return NextResponse.json(
          { error: "Chat not found" },
          { status: 404 }
        );
      }
    } else {
      chatHistory = await prisma.chatHistory.create({
        data: {
          userId: user.id,
          topic,
          aiProvider: provider || aiService.getPreferredProvider(),
        },
      });
    }

    // Get previous messages for context
    const previousMessages = chatHistory.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add current message
    const messages = [...previousMessages, { role: "user" as const, content: message }];

    // Get AI response
    const selectedProvider = provider || chatHistory.aiProvider;
    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPTS.TUTOR;

    const aiResponse = await aiService.chat(
      messages,
      finalSystemPrompt,
      selectedProvider as AIProvider
    );

    // Save user message
    await prisma.chatMessage.create({
      data: {
        chatHistoryId: chatHistory.id,
        role: "user",
        content: message,
      },
    });

    // Save AI response
    const savedResponse = await prisma.chatMessage.create({
      data: {
        chatHistoryId: chatHistory.id,
        role: "assistant",
        content: aiResponse.content,
        tokens: aiResponse.tokens.total,
      },
    });

    // Update chat history
    await prisma.chatHistory.update({
      where: { id: chatHistory.id },
      data: { aiProvider: selectedProvider },
    });

    return NextResponse.json({
      success: true,
      message: aiResponse.content,
      chatId: chatHistory.id,
      tokens: aiResponse.tokens,
      provider: aiResponse.provider,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// GET /api/ai/chat/[chatId]
// Get chat history
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const chatHistory = await prisma.chatHistory.findUnique({
      where: { id: params.chatId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatHistory || chatHistory.userId !== user.id) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}
