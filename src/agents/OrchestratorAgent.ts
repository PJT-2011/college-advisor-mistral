/**
 * Orchestrator Agent
 * 
 * Main controller that receives user messages, classifies intents,
 * delegates to specialized agents, and synthesizes final responses.
 */

import { getMistralService } from '@/lib/mistral';
import type MistralService from '@/lib/mistral';
import { AcademicAgent } from './AcademicAgent';
import { WellnessAgent } from './WellnessAgent';
import { CampusLifeAgent } from './CampusLifeAgent';
import { AgentContext, AgentResponse } from './BaseAgent';
import { prisma } from '@/lib/prisma';

export type IntentType = 'academic' | 'wellness' | 'campus_life' | 'general' | 'emergency';

interface OrchestratorResponse extends AgentResponse {
  intent: IntentType;
  delegatedAgent: string;
  conversationId?: string;
}

export class OrchestratorAgent {
  private mistral: MistralService;
  private academicAgent: AcademicAgent;
  private wellnessAgent: WellnessAgent;
  private campusLifeAgent: CampusLifeAgent;

  constructor() {
    this.mistral = getMistralService();
    this.academicAgent = new AcademicAgent();
    this.wellnessAgent = new WellnessAgent();
    this.campusLifeAgent = new CampusLifeAgent();
  }

  /**
   * Main entry point: Process user message through multi-agent system
   */
  async processMessage(
    message: string,
    userId: string,
    sessionId?: string
  ): Promise<OrchestratorResponse> {
    try {
      // Build context
      const context = await this.buildContext(userId);

      // Classify intent
      const intent = await this.classifyIntent(message, context);

      // Delegate to appropriate agent
      const agentResponse = await this.delegateToAgent(message, intent, context);

      // Save message to database
      await this.saveMessage(userId, message, 'user', intent);
      await this.saveMessage(
        userId,
        agentResponse.content,
        'assistant',
        intent,
        agentResponse.metadata?.agentType || 'orchestrator',
        agentResponse.metadata
      );

      // Save advice log if applicable
      if (this.shouldSaveAdvice(agentResponse, intent)) {
        await this.saveAdviceLog(userId, agentResponse, intent);
      }

      return {
        ...agentResponse,
        intent,
        delegatedAgent: agentResponse.metadata?.agentType || 'general',
      };
    } catch (error) {
      console.error('Orchestrator error:', error);
      
      // Fallback response
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
        confidence: 0.0,
        toolsUsed: [],
        intent: 'general',
        delegatedAgent: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Classify user intent using Mistral
   */
  private async classifyIntent(message: string, context: AgentContext): Promise<IntentType> {
    // Quick keyword-based classification first (faster)
    const quickIntent = this.quickClassify(message);
    if (quickIntent === 'emergency') {
      return 'emergency'; // Don't need LLM for crisis detection
    }

    // Use specialized agents' canHandle methods
    const [canHandleAcademic, canHandleWellness, canHandleCampus] = await Promise.all([
      this.academicAgent.canHandle(message, context),
      this.wellnessAgent.canHandle(message, context),
      this.campusLifeAgent.canHandle(message, context),
    ]);

    // Priority order: wellness (for crisis), academic, campus life
    if (canHandleWellness) return 'wellness';
    if (canHandleAcademic) return 'academic';
    if (canHandleCampus) return 'campus_life';

    // Use Mistral for classification if no agent matches
    try {
      const categories = ['academic', 'wellness', 'campus_life', 'general'];
      const classified = await this.mistral.classify(
        message,
        categories,
        'You are classifying college student questions into categories.'
      );
      
      return classified as IntentType;
    } catch (error) {
      console.error('Classification error:', error);
      return quickIntent || 'general';
    }
  }

  /**
   * Quick keyword-based classification (before LLM)
   */
  private quickClassify(message: string): IntentType | null {
    const msg = message.toLowerCase();

    // Emergency keywords
    const emergencyKeywords = ['suicide', 'kill myself', 'want to die', 'self-harm'];
    if (emergencyKeywords.some(kw => msg.includes(kw))) {
      return 'emergency';
    }

    return null;
  }

  /**
   * Delegate message to appropriate specialized agent
   */
  private async delegateToAgent(
    message: string,
    intent: IntentType,
    context: AgentContext
  ): Promise<AgentResponse> {
    switch (intent) {
      case 'academic':
        return this.academicAgent.process(message, context);
      
      case 'wellness':
      case 'emergency':
        return this.wellnessAgent.process(message, context);
      
      case 'campus_life':
        return this.campusLifeAgent.process(message, context);
      
      case 'general':
      default:
        return this.handleGeneralQuery(message, context);
    }
  }

  /**
   * Handle general queries not covered by specialized agents
   */
  private async handleGeneralQuery(message: string, context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `You are a helpful college life advisor assistant. 
You provide general guidance and can discuss various topics related to college life.
Be friendly, supportive, and provide practical advice when possible.`;

    const prompt = this.buildPrompt(message, context);
    
    try {
      const response = await this.mistral.generate(prompt, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 400,
      });

      return {
        content: response,
        confidence: 0.8,
        toolsUsed: [],
        metadata: {
          agentType: 'general',
          intent: 'general',
        },
      };
    } catch (error) {
      console.error('General query error:', error);
      // Fallback to rule-based response
      const lowerMessage = message.toLowerCase();
      
      let response = "I'm here to help with:\n\n";
      response += "📚 Academic Support: Study tips, time management, exam preparation\n";
      response += "💚 Wellness: Stress management, mental health resources\n";
      response += "🎓 Campus Life: Clubs, events, resources, and activities\n\n";
      response += "What would you like help with?";

      if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        response = "I'm your college advisor assistant! I can help you with:\n\n";
        response += "- Academic planning - study schedules, exam prep, course advice\n";
        response += "- Wellness support - stress management, work-life balance\n";
        response += "- Campus resources - finding clubs, services, and activities\n\n";
        response += "Just ask me anything about college life!";
      } else if (lowerMessage.includes('thank')) {
        response = "You're welcome! Feel free to ask if you need anything else. I'm here to help!";
      } else if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        const name = context.userProfile?.name || 'there';
        response = `Hi ${name}! How can I help you today? I can assist with academics, wellness, or campus life questions.`;
      }

      return {
        content: response,
        confidence: 0.6,
        toolsUsed: [],
        metadata: {
          agentType: 'general',
          intent: 'general',
        },
      };
    }
  }

  /**
   * Build context from user data and conversation history
   */
  private async buildContext(userId: string): Promise<AgentContext> {
    try {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      // Get recent conversation history
      const recentMessages = await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const conversationHistory = recentMessages
        .reverse()
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));

      return {
        userId,
        userProfile: user,
        conversationHistory,
        metadata: {},
      };
    } catch (error) {
      console.error('Context building error:', error);
      return {
        userId,
        metadata: {},
      };
    }
  }

  /**
   * Build prompt with context including conversation history
   */
  private buildPrompt(message: string, context: AgentContext): string {
    let prompt = '';

    // Add user profile context
    if (context.userProfile) {
      const profile = context.userProfile.profile;
      prompt += `Student Profile:\n`;
      prompt += `- Name: ${context.userProfile.name}\n`;
      if (profile?.major) prompt += `- Major: ${profile.major}\n`;
      if (profile?.year) prompt += `- Year: ${profile.year}\n`;
      if (profile?.interests) prompt += `- Interests: ${profile.interests}\n`;
      if (profile?.stressLevel) prompt += `- Current Stress Level: ${profile.stressLevel}/10\n`;
      prompt += '\n';
    }

    // Add recent conversation history for context continuity
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += `Recent Conversation:\n`;
      const recentHistory = context.conversationHistory.slice(-6); // Last 3 exchanges
      for (const msg of recentHistory) {
        const speaker = msg.role === 'user' ? 'Student' : 'Advisor';
        prompt += `${speaker}: ${msg.content}\n`;
      }
      prompt += '\n';
    }

    prompt += `Current Question: ${message}\n\n`;
    prompt += `Response:`;

    return prompt;
  }

  /**
   * Save message to database
   */
  private async saveMessage(
    userId: string,
    content: string,
    role: string,
    intent?: IntentType,
    agentType?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          userId,
          role,
          content,
          intent: intent || null,
          agentType: agentType || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    } catch (error) {
      console.error('Save message error:', error);
    }
  }

  /**
   * Check if advice should be saved as log
   */
  private shouldSaveAdvice(response: AgentResponse, intent: IntentType): boolean {
    // Save advice for academic planning, wellness check-ins, resource recommendations
    const saveableIntents: IntentType[] = ['academic', 'wellness'];
    return saveableIntents.includes(intent) && response.confidence > 0.7;
  }

  /**
   * Save advice to advice_logs table
   */
  private async saveAdviceLog(
    userId: string,
    response: AgentResponse,
    intent: IntentType
  ): Promise<void> {
    try {
      const category = this.mapIntentToCategory(intent, response.metadata?.intent);
      
      await prisma.adviceLog.create({
        data: {
          userId,
          category,
          title: this.generateAdviceTitle(response, intent),
          content: response.content,
          agentType: response.metadata?.agentType || 'general',
          priority: this.calculatePriority(response),
          metadata: response.metadata ? JSON.stringify(response.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Save advice log error:', error);
    }
  }

  /**
   * Map intent to advice category
   */
  private mapIntentToCategory(intent: IntentType, specificIntent?: string): string {
    if (specificIntent) {
      if (specificIntent.includes('exam')) return 'study_plan';
      if (specificIntent.includes('wellness') || specificIntent.includes('stress')) return 'wellness_check';
      if (specificIntent.includes('time')) return 'time_management';
      if (specificIntent.includes('resource')) return 'campus_resource';
    }

    switch (intent) {
      case 'academic': return 'study_plan';
      case 'wellness': return 'wellness_check';
      case 'campus_life': return 'campus_resource';
      default: return 'general';
    }
  }

  /**
   * Generate title for advice log
   */
  private generateAdviceTitle(response: AgentResponse, intent: IntentType): string {
    const prefix = intent.charAt(0).toUpperCase() + intent.slice(1);
    const timestamp = new Date().toLocaleDateString();
    
    return `${prefix} Advice - ${timestamp}`;
  }

  /**
   * Calculate advice priority
   */
  private calculatePriority(response: AgentResponse): string {
    if (response.metadata?.isCrisis) return 'urgent';
    if (response.confidence > 0.85) return 'high';
    if (response.confidence > 0.7) return 'medium';
    return 'low';
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      return await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Get conversation history error:', error);
      return [];
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversation(userId: string): Promise<void> {
    try {
      await prisma.message.deleteMany({
        where: { userId },
      });
    } catch (error) {
      console.error('Clear conversation error:', error);
      throw error;
    }
  }
}

export default OrchestratorAgent;
