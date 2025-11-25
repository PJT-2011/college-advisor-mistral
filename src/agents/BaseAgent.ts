/**
 * Base Agent Class
 * 
 * Abstract base class for all specialized agents in the system.
 */

import { getMistralService } from '@/lib/mistral';
import type MistralService from '@/lib/mistral';

export interface AgentContext {
  userId: string;
  userProfile?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  toolsUsed: string[];
  metadata?: Record<string, any>;
}

export abstract class BaseAgent {
  protected name: string;
  protected description: string;
  protected mistral: MistralService;
  protected systemPrompt: string;

  constructor(name: string, description: string, systemPrompt: string) {
    this.name = name;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.mistral = getMistralService();
  }

  /**
   * Process a user message and generate a response
   */
  abstract process(
    message: string,
    context: AgentContext
  ): Promise<AgentResponse>;

  /**
   * Check if this agent can handle the given message
   */
  abstract canHandle(message: string, context: AgentContext): Promise<boolean>;

  /**
   * Get agent information
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
    };
  }

  /**
   * Helper: Generate response with Mistral
   */
  protected async generate(prompt: string, temperature?: number): Promise<string> {
    return this.mistral.generate(prompt, {
      systemPrompt: this.systemPrompt,
      temperature,
      maxTokens: 512,
    });
  }

  /**
   * Helper: Stream response with Mistral
   */
  protected async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    yield* this.mistral.generateStream(prompt, {
      systemPrompt: this.systemPrompt,
    });
  }

  /**
   * Helper: Build context-aware prompt
   */
  protected buildContextPrompt(message: string, context: AgentContext): string {
    let prompt = '';

    // Add user profile if available
    if (context.userProfile) {
      const profile = context.userProfile.profile;
      prompt += `User Profile:\n`;
      prompt += `- Name: ${context.userProfile.name}\n`;
      if (profile?.major) prompt += `- Major: ${profile.major}\n`;
      if (profile?.year) prompt += `- Year: ${profile.year}\n`;
      if (profile?.interests) {
        // Handle interests as either string or array
        const interestsStr = Array.isArray(profile.interests) 
          ? profile.interests.join(', ') 
          : profile.interests;
        prompt += `- Interests: ${interestsStr}\n`;
      }
      if (profile?.stressLevel) prompt += `- Stress Level: ${profile.stressLevel}\n`;
      prompt += '\n';
    }

    // Add recent conversation history
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += `Recent Conversation:\n`;
      context.conversationHistory.slice(-5).forEach((msg) => {
        prompt += `${msg.role === 'user' ? 'Student' : 'Advisor'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    // Add current message
    prompt += `Current Question: ${message}\n\n`;
    prompt += `Response:`;

    return prompt;
  }

  /**
   * Helper: Extract confidence score from response
   */
  protected extractConfidence(response: string): number {
    // Simple heuristic: longer, more detailed responses = higher confidence
    const wordCount = response.split(/\s+/).length;
    if (wordCount < 20) return 0.5;
    if (wordCount < 50) return 0.7;
    if (wordCount < 100) return 0.85;
    return 0.95;
  }
}

export default BaseAgent;
