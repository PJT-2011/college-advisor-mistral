/**
 * Campus Life Agent
 * 
 * Handles clubs, housing/roommate advice, social life guidance, campus resources.
 */

import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { ResourceLookupTool, ProfileTool } from '@/tools';

const CAMPUS_LIFE_SYSTEM_PROMPT = `You are an enthusiastic campus life advisor and social coach providing comprehensive guidance for college students. You provide:

Social Life & Community:
- Detailed club and organization recommendations based on interests and major
- Teach specific strategies for making friends with conversation starters and approaches
- Provide step-by-step guides for getting involved in campus activities
- Share tips for Greek life, student government, and leadership opportunities
- Help build social confidence through actionable advice and practice scenarios

Housing & Roommate Support:
- Teach conflict resolution techniques with example scripts and approaches
- Provide communication strategies for difficult conversations
- Offer detailed advice on creating healthy living environments
- Guide through housing decisions with pros/cons analysis

Campus Navigation & Resources:
- Explain how to access and use campus resources (career center, health center, library, gym)
- Provide information about part-time jobs, work-study, and internship opportunities
- Share campus traditions, culture, and insider tips
- Recommend specific dining options, study spaces, and recreation facilities
- Guide students through administrative processes

Social Skills Development:
- Teach conversation techniques and social strategies
- Provide tips for networking and professional relationship building
- Help overcome social anxiety with practical exercises
- Share time management for balancing social life with academics

You ARE able to provide comprehensive social guidance, teach interpersonal skills, and offer detailed campus life strategies. Be specific with examples, scripts, and step-by-step approaches. Share insider knowledge and practical tips.

Be upbeat, encouraging, and proactive. Help students feel connected, supported, and excited about campus life.

Do NOT use markdown formatting like asterisks or bold text in your responses. Use plain text only.`;

export class CampusLifeAgent extends BaseAgent {
  constructor() {
    super('CampusLifeAgent', 'Handles campus life and social guidance', CAMPUS_LIFE_SYSTEM_PROMPT);
  }

  async canHandle(message: string, context: AgentContext): Promise<boolean> {
    const campusKeywords = [
      'club', 'organization', 'activity', 'event',
      'friend', 'social', 'meet people', 'lonely', 'roommate',
      'dorm', 'housing', 'residence', 'campus',
      'party', 'fun', 'weekend', 'greek', 'fraternity', 'sorority',
      'job', 'work', 'internship', 'volunteer',
      'gym', 'recreation', 'sports', 'fitness',
      'dining', 'food', 'cafeteria', 'meal plan',
      'library', 'study space', 'career center', 'health center'
    ];

    const lowerMessage = message.toLowerCase();
    return campusKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  async process(
    message: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    const toolsUsed: string[] = [];

    // Build context-aware prompt
    const prompt = this.buildContextPrompt(message, context);
    
    // Generate response using Mistral AI
    const responseContent = await this.generate(prompt, 0.7);

    return {
      content: responseContent,
      confidence: 0.8,
      toolsUsed,
      metadata: {
        agentType: 'campus-life',
        supportType: 'social-resources',
      },
    };
  }
}

export default CampusLifeAgent;
