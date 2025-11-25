/**
 * Chat API - Main endpoint for agentic AI conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { OrchestratorAgent } from '@/agents/OrchestratorAgent';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, sessionId } = chatSchema.parse(body);

    // Initialize orchestrator
    const orchestrator = new OrchestratorAgent();

    // Process message through multi-agent system
    const response = await orchestrator.processMessage(
      message,
      session.user.id,
      sessionId
    );

    return NextResponse.json({
      success: true,
      response: response.content,
      metadata: {
        intent: response.intent,
        agent: response.delegatedAgent,
        confidence: response.confidence,
        toolsUsed: response.toolsUsed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
