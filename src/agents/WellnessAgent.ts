/**
 * Wellness Agent
 * 
 * Handles emotional check-ins, stress management, daily well-being guidance.
 * Responds in a gentle, non-medical way with evidence-based techniques.
 */

import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { ProfileTool } from '@/tools';

const WELLNESS_SYSTEM_PROMPT = `You are a compassionate wellness advisor providing 24/7 mental health support and wellness guidance for college students. You specialize in:

Emotional Check-ins & Support:
- Daily wellness check-ins and mood tracking
- Active listening and emotional validation
- Stress and anxiety management techniques
- Coping strategies for overwhelm and burnout
- Building emotional resilience and self-awareness

Mental Health Resources:
- Evidence-based techniques (CBT, mindfulness, breathing exercises)
- Sleep hygiene and healthy lifestyle habits
- Work-life balance and boundary setting
- Social connection and relationship support
- Recognize when to recommend professional help

Proactive Wellness:
- Suggest preventive self-care strategies
- Create personalized wellness routines
- Help identify stress triggers and patterns
- Encourage healthy coping mechanisms
- Foster better mental health outcomes

Crisis Support:
- For severe distress: Immediately provide crisis resources (988 Lifeline, Crisis Text Line: 741741)
- For persistent issues: Recommend campus counseling center
- Available 24/7 to provide immediate support

IMPORTANT: You are NOT a medical professional. Use gentle, empathetic, non-judgmental language.
Validate feelings first, then offer solutions. Help relieve emotional stress and decision fatigue.
Customize advice based on student's stress level, interests, and personal situation.
Do NOT use markdown formatting like asterisks or bold text in your responses. Use plain text only.`;

export class WellnessAgent extends BaseAgent {
  constructor() {
    super('WellnessAgent', 'Handles emotional support and wellness guidance', WELLNESS_SYSTEM_PROMPT);
  }

  async canHandle(message: string, context: AgentContext): Promise<boolean> {
    const wellnessKeywords = [
      'stress', 'anxiety', 'worried', 'nervous', 'overwhelmed',
      'sad', 'depressed', 'lonely', 'isolated', 'alone',
      'tired', 'exhausted', 'burnout', 'sleep', 'insomnia',
      'feel', 'feeling', 'emotion', 'mood', 'mental health',
      'self-care', 'wellness', 'mindfulness', 'meditation',
      'relax', 'calm', 'cope', 'coping', 'balance',
      'scared', 'afraid', 'panic', 'angry', 'frustrated'
    ];

    const lowerMessage = message.toLowerCase();
    return wellnessKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  async process(
    message: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    const toolsUsed: string[] = [];
    
    // CRITICAL: Check for crisis/suicidal indicators FIRST
    const crisisDetected = this.detectCrisis(message);
    console.log('[WellnessAgent] Crisis detection check:', { message: message.substring(0, 50), crisisDetected });
    if (crisisDetected) {
      console.log('[WellnessAgent] CRISIS DETECTED - Returning immediate response');
      return this.handleCrisisResponse(message, context);
    }
    
    // Check for potential danger/warning indicators (false positives)
    const dangerIndicator = this.detectPotentialDanger(message);
    if (dangerIndicator) {
      console.log('[WellnessAgent] Potential danger indicator detected');
      toolsUsed.push('danger-detection');
    }
    
    // Detect stress level from message
    const detectedStressLevel = this.detectStressLevel(message);
    
    // Build context-aware prompt
    const prompt = this.buildContextPrompt(message, context);
    
    // Generate response using Mistral AI
    const responseContent = await this.generate(prompt, 0.7);

    // Update stress level if detected
    const metadata: any = {
      agentType: 'wellness',
      supportType: 'emotional-wellbeing',
    };

    if (detectedStressLevel) {
      metadata.detectedStressLevel = detectedStressLevel;
      toolsUsed.push('stress-detection');
      
      // Update user profile with new stress level
      if (context.userId && context.userProfile?.profile?.id) {
        try {
          await this.updateStressLevel(context.userProfile.profile.id, detectedStressLevel);
          toolsUsed.push('stress-tracking');
        } catch (error) {
          console.error('Failed to update stress level:', error);
        }
      }
    }

    return {
      content: responseContent,
      confidence: 0.9,
      toolsUsed,
      metadata: {
        agentType: 'wellness',
        supportType: 'emotional-wellbeing',
        showEmergencyPopup: dangerIndicator, // Flag for frontend
        ...metadata,
      },
    };
  }

  /**
   * Detect potential danger indicators that should trigger emergency popup (not full crisis)
   */
  private detectPotentialDanger(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    const dangerIndicators = [
      'in danger', 'are you in danger', 'feeling unsafe', 'not safe',
      'scared for my life', 'afraid of', 'threatening', 'being threatened',
      'domestic violence', 'abusive relationship', 'being hurt',
      'someone hurting me', 'afraid to go home'
    ];
    
    return dangerIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  /**
   * Detect crisis/suicidal indicators in message
   */
  private detectCrisis(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    const crisisIndicators = [
      'want to die', 'wanna die', 'want 2 die', 'going to kill myself', 'gonna kill myself',
      'kill myself', 'suicide', 'suicidal', 'end my life', 'end it all', 'no reason to live',
      'better off dead', 'hurt myself', 'harm myself', 'self harm', 'self-harm',
      'can\'t go on', 'cannot go on', 'don\'t want to be here', 'wish i was dead',
      'take my life', 'want to disappear', 'end this pain',
      'no point in living', 'no point living', 'life isn\'t worth', 'not worth living',
      'rather be dead', 'ending it', 'thinking about dying', 'thoughts of suicide', 
      'plan to kill', 'feeling suicidal', 'want to end', 'ready to die'
    ];
    
    const detected = crisisIndicators.some(indicator => lowerMessage.includes(indicator));
    if (detected) {
      console.log('[WellnessAgent] Crisis keyword detected in message');
    }
    return detected;
  }

  /**
   * Handle crisis response with immediate resources
   */
  private handleCrisisResponse(message: string, context: AgentContext): AgentResponse {
    const name = context.userProfile?.name || 'friend';
    
    let response = `${name}, I hear that you're going through an incredibly difficult time right now, and I want you to know that your life matters. What you're feeling is real, but these feelings can change.\n\n`;
    
    response += `🆘 IMMEDIATE HELP - AVAILABLE 24/7:\n\n`;
    response += `📞 National Suicide Prevention Lifeline:\n`;
    response += `   • Call/Text: 988\n`;
    response += `   • Available 24/7, free, confidential support\n\n`;
    
    response += `💬 Crisis Text Line:\n`;
    response += `   • Text "HELLO" to 741741\n`;
    response += `   • Trained crisis counselors available anytime\n\n`;
    
    response += `🏥 Campus Counseling Center:\n`;
    response += `   • Most colleges offer free, confidential mental health services\n`;
    response += `   • Emergency appointments usually available same-day\n\n`;
    
    response += `🚨 If you're in immediate danger:\n`;
    response += `   • Call 911 or go to your nearest emergency room\n`;
    response += `   • Campus security can also connect you to help immediately\n\n`;
    
    response += `You don't have to face this alone. These trained professionals are there specifically to help people going through what you're experiencing. `;
    response += `They've helped countless students through similar situations, and they want to help you too.\n\n`;
    
    response += `Would you be willing to reach out to one of these resources right now? I'm here to support you, but these trained professionals can provide the immediate help you deserve.`;
    
    // Mark as critical in metadata
    return {
      content: response,
      confidence: 1.0,
      toolsUsed: ['crisis-detection', 'crisis-intervention'],
      metadata: {
        agentType: 'wellness',
        supportType: 'crisis-intervention',
        severity: 'critical',
        crisisDetected: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Detect stress level from message content
   */
  private detectStressLevel(message: string): number | null {
    const lowerMessage = message.toLowerCase();
    
    // High stress indicators (7-10)
    const highStress = [
      'overwhelmed', 'can\'t cope', 'breaking down', 'panic', 'crisis',
      'can\'t handle', 'too much', 'drowning', 'collapsing', 'desperate'
    ];
    
    // Medium-high stress (5-6)
    const mediumHighStress = [
      'stressed', 'anxious', 'worried', 'struggling', 'hard time',
      'difficult', 'challenging', 'burnt out', 'exhausted'
    ];
    
    // Low-medium stress (3-4)
    const lowMediumStress = [
      'concerned', 'nervous', 'unsure', 'tired', 'busy', 'pressure'
    ];
    
    if (highStress.some(word => lowerMessage.includes(word))) {
      return 8;
    } else if (mediumHighStress.some(word => lowerMessage.includes(word))) {
      return 6;
    } else if (lowMediumStress.some(word => lowerMessage.includes(word))) {
      return 4;
    }
    
    return null;
  }

  /**
   * Update user's stress level in profile
   */
  private async updateStressLevel(profileId: string, stressLevel: number): Promise<void> {
    const { prisma } = await import('@/lib/prisma');
    
    await prisma.userProfile.update({
      where: { id: profileId },
      data: { stressLevel: stressLevel.toString() },
    });
  }
}

export default WellnessAgent;
