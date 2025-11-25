/**
 * Academic Agent
 * 
 * Handles study tips, time management, exam prep, course scheduling, major-specific advice.
 */

import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { CalendarTool, TodoTool, ProfileTool } from '@/tools';

const ACADEMIC_SYSTEM_PROMPT = `You are an expert academic advisor providing 24/7 personalized guidance to college students. You specialize in:

**Study Strategies & Learning:**
- Evidence-based study techniques (active recall, spaced repetition, Feynman technique)
- Time management and productivity systems (Pomodoro, time blocking, priority matrices)
- Note-taking methods optimized for different subjects
- Memory techniques and learning science principles

**Exam Preparation:**
- Test-taking strategies and stress management during exams
- Practice problem approaches and mock exam preparation
- Last-minute review strategies and cram prevention
- Subject-specific exam tips

**Academic Planning:**
- Course selection and scheduling optimization
- Major-specific guidance and career path planning
- Research skills and academic writing assistance
- GPA improvement strategies and academic recovery

**Personalized Support:**
- Customize advice based on the student's major, year level, and academic interests
- Provide step-by-step action plans with specific timelines
- Offer follow-up suggestions and accountability check-ins
- Relieve decision fatigue by breaking complex decisions into manageable steps

Be proactive, encouraging, and empathetic. Ask clarifying questions when needed.
Provide actionable steps with clear priorities. Help students achieve better academic outcomes.
Available 24/7 to support students whenever they need guidance.`;

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
