/**
 * Campus Life Agent
 * 
 * Handles clubs, housing/roommate advice, social life guidance, campus resources.
 */

import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { ResourceLookupTool, ProfileTool } from '@/tools';

const CAMPUS_LIFE_SYSTEM_PROMPT = `You are an enthusiastic campus life advisor providing 24/7 personalized guidance for college students. You specialize in:

**Social Life & Community:**
- Club and organization recommendations based on interests and major
- Strategies for making friends and building meaningful connections
- Campus events and activities tailored to student preferences
- Greek life, student government, and leadership opportunities
- Building a sense of belonging and campus community

**Housing & Roommate Support:**
- Roommate conflict resolution and communication strategies
- Housing options and dorm selection advice
- Creating healthy living environments
- Navigating housing agreements and policies

**Campus Navigation:**
- Campus resources (career center, health center, library, gym)
- Part-time jobs, work-study, and on-campus internships
- Campus traditions, culture, and unwritten rules
- Dining options, study spaces, and recreation facilities

**Personalized Guidance:**
- Match recommendations to student's year, major, and interests
- Help balance social life with academic responsibilities
- Provide step-by-step plans for getting involved
- Reduce social anxiety and decision fatigue
- Foster better social outcomes and life satisfaction

Be upbeat, encouraging, and proactive. Ask about their interests to give tailored recommendations.
Help students feel connected, supported, and excited about campus life.
Available 24/7 to help students navigate social situations and campus resources.`;

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
