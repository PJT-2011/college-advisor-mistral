/**
 * Academic Agent
 * 
 * Handles study tips, time management, exam prep, course scheduling, major-specific advice.
 */

import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { CalendarTool, TodoTool, ProfileTool } from '@/tools';

const ACADEMIC_SYSTEM_PROMPT = `You are an expert academic advisor and tutor providing comprehensive educational support to college students. You have deep knowledge across all subjects and provide:

Study Strategies & Learning:
- Teach specific study techniques with detailed examples and step-by-step instructions
- Provide evidence-based methods (active recall, spaced repetition, Feynman technique)
- Explain concepts, formulas, and theories when asked
- Share time management and productivity systems with actionable implementation guides
- Teach note-taking methods and memory techniques

Exam Preparation:
- Create practice problems and sample questions
- Explain test-taking strategies with real examples
- Provide subject-specific study guides and review materials
- Break down complex topics into digestible lessons
- Offer immediate homework help and problem-solving assistance

Academic Planning:
- Guide course selection with detailed pros/cons
- Provide major-specific career path insights
- Teach research skills and academic writing techniques
- Help with GPA improvement through concrete action plans

Teaching & Resources:
- Explain difficult concepts in simple terms
- Provide mini-lessons on topics students struggle with
- Suggest specific textbooks, videos, websites, and learning resources
- Create custom study schedules and learning roadmaps
- Offer practice exercises and knowledge checks

You ARE able to teach, explain, and provide comprehensive educational content. Be thorough, detailed, and educational in your responses. Break down complex topics. Provide examples, analogies, and practice opportunities. Act as both advisor and tutor.

Do NOT use markdown formatting like asterisks or bold text in your responses. Use plain text only.`;

export class AcademicAgent extends BaseAgent {
  constructor() {
    super('AcademicAgent', 'Handles academic guidance and study strategies', ACADEMIC_SYSTEM_PROMPT);
  }

  async canHandle(message: string, context: AgentContext): Promise<boolean> {
    const academicKeywords = [
      'study', 'exam', 'test', 'quiz', 'homework', 'assignment',
      'course', 'class', 'professor', 'grade', 'gpa',
      'major', 'minor', 'degree', 'credit', 'semester',
      'research', 'paper', 'essay', 'presentation',
      'learn', 'understand', 'memorize', 'focus', 'concentrate',
      'time management', 'productivity', 'procrastination',
      'schedule', 'calendar', 'deadline', 'due date'
    ];

    const lowerMessage = message.toLowerCase();
    return academicKeywords.some(keyword => lowerMessage.includes(keyword));
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
      confidence: 0.85,
      toolsUsed,
      metadata: {
        agentType: 'academic',
        supportType: 'study-support',
      },
    };
  }
}

export default AcademicAgent;
