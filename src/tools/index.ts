/**
 * Tools and Utilities for Agents
 * 
 * Provides calendar, todo, resource lookup, and profile tools for the multi-agent system.
 */

import { prisma } from '@/lib/prisma';
import { addDays, format, startOfWeek, endOfWeek } from 'date-fns';

// ============================================================================
// CALENDAR TOOL - Build study schedules
// ============================================================================

export interface StudyBlock {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  type: 'study' | 'review' | 'assignment' | 'exam_prep';
}

export class CalendarTool {
  /**
   * Generate a weekly study schedule based on courses and availability
   */
  static generateStudySchedule(params: {
    courses: string[];
    hoursPerWeek: number;
    preferredTimes: string[]; // e.g., ['morning', 'afternoon', 'evening']
    breakDuration: number; // minutes
  }): StudyBlock[] {
    const { courses, hoursPerWeek, preferredTimes, breakDuration } = params;
    const schedule: StudyBlock[] = [];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hoursPerCourse = hoursPerWeek / courses.length;
    const blocksPerCourse = Math.ceil(hoursPerCourse / 2); // 2-hour blocks

    const timeSlots: Record<string, string[]> = {
      morning: ['08:00', '10:00'],
      afternoon: ['13:00', '15:00', '17:00'],
      evening: ['19:00', '21:00'],
    };

    let dayIndex = 0;
    
    courses.forEach((course) => {
      for (let i = 0; i < blocksPerCourse; i++) {
        const day = daysOfWeek[dayIndex % daysOfWeek.length];
        const timeCategory = preferredTimes[i % preferredTimes.length] as keyof typeof timeSlots;
        const startTime = timeSlots[timeCategory][i % timeSlots[timeCategory].length];
        
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = hours + 2;
        const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        schedule.push({
          day,
          startTime,
          endTime,
          subject: course,
          type: i === 0 ? 'study' : 'review',
        });

        dayIndex++;
      }
    });

    return schedule.sort((a, b) => {
      const dayOrder = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Create exam prep schedule leading up to exam date
   */
  static generateExamPrepSchedule(params: {
    examDate: Date;
    subject: string;
    daysToStudy: number;
    hoursPerDay: number;
  }): StudyBlock[] {
    const { examDate, subject, daysToStudy, hoursPerDay } = params;
    const schedule: StudyBlock[] = [];
    
    for (let i = daysToStudy; i > 0; i--) {
      const studyDate = addDays(examDate, -i);
      const dayName = format(studyDate, 'EEEE');
      
      // Morning session
      schedule.push({
        day: `${dayName} (${format(studyDate, 'MMM dd')})`,
        startTime: '09:00',
        endTime: `${9 + Math.floor(hoursPerDay / 2)}:00`,
        subject,
        type: i > 3 ? 'study' : 'exam_prep',
      });
      
      // Afternoon session if needed
      if (hoursPerDay > 2) {
        schedule.push({
          day: `${dayName} (${format(studyDate, 'MMM dd')})`,
          startTime: '14:00',
          endTime: `${14 + Math.ceil(hoursPerDay / 2)}:00`,
          subject,
          type: 'review',
        });
      }
    }

    return schedule;
  }

  /**
   * Format schedule for display
   */
  static formatSchedule(schedule: StudyBlock[]): string {
    let output = '📅 Your Study Schedule:\n\n';
    
    let currentDay = '';
    schedule.forEach((block) => {
      if (block.day !== currentDay) {
        output += `\n**${block.day}**\n`;
        currentDay = block.day;
      }
      output += `  • ${block.startTime} - ${block.endTime}: ${block.subject} (${block.type.replace('_', ' ')})\n`;
    });

    return output;
  }
}

// ============================================================================
// TODO TOOL - Create daily/weekly tasks
// ============================================================================

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: 'academic' | 'personal' | 'wellness' | 'social';
  estimatedTime?: number; // minutes
  completed: boolean;
}

export class TodoTool {
  /**
   * Generate daily todos based on goals and schedule
   */
  static generateDailyTodos(params: {
    goals: string[];
    courses: string[];
    date: Date;
  }): TodoItem[] {
    const { goals, courses, date } = params;
    const todos: TodoItem[] = [];
    const dateStr = format(date, 'yyyy-MM-dd');

    // Morning routine
    todos.push({
      id: `morning-${dateStr}`,
      title: '🌅 Morning Review',
      description: 'Review notes from yesterday, plan today',
      priority: 'medium',
      dueDate: `${dateStr} 08:00`,
      category: 'academic',
      estimatedTime: 15,
      completed: false,
    });

    // Course-specific tasks
    courses.forEach((course, i) => {
      todos.push({
        id: `course-${i}-${dateStr}`,
        title: `📚 Study ${course}`,
        description: 'Work through assigned readings/problems',
        priority: 'high',
        dueDate: `${dateStr} ${10 + i * 2}:00`,
        category: 'academic',
        estimatedTime: 60,
        completed: false,
      });
    });

    // Wellness check
    todos.push({
      id: `wellness-${dateStr}`,
      title: '🧘 Wellness Break',
      description: 'Take a walk, meditate, or do light exercise',
      priority: 'medium',
      dueDate: `${dateStr} 16:00`,
      category: 'wellness',
      estimatedTime: 20,
      completed: false,
    });

    // Evening review
    todos.push({
      id: `evening-${dateStr}`,
      title: '🌙 Evening Wrap-up',
      description: 'Review what you learned, prepare for tomorrow',
      priority: 'low',
      dueDate: `${dateStr} 20:00`,
      category: 'academic',
      estimatedTime: 15,
      completed: false,
    });

    return todos;
  }

  /**
   * Generate weekly todos
   */
  static generateWeeklyTodos(params: {
    goals: string[];
    courses: string[];
    weekStart: Date;
  }): TodoItem[] {
    const { goals, courses, weekStart } = params;
    const todos: TodoItem[] = [];

    // Assignment tracking
    courses.forEach((course, i) => {
      todos.push({
        id: `assignment-${course}-${format(weekStart, 'yyyy-MM-dd')}`,
        title: `📝 ${course} - Weekly Assignment`,
        description: 'Complete and submit weekly homework',
        priority: 'high',
        dueDate: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
        category: 'academic',
        estimatedTime: 120,
        completed: false,
      });
    });

    // Weekly goals
    goals.forEach((goal, i) => {
      todos.push({
        id: `goal-${i}-${format(weekStart, 'yyyy-MM-dd')}`,
        title: `🎯 ${goal}`,
        description: 'Work towards your personal goal',
        priority: 'medium',
        dueDate: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
        category: 'personal',
        estimatedTime: 90,
        completed: false,
      });
    });

    return todos;
  }

  /**
   * Prioritize todos by urgency and importance
   */
  static prioritizeTodos(todos: TodoItem[]): TodoItem[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    
    return todos.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }

  /**
   * Format todos for display
   */
  static formatTodos(todos: TodoItem[]): string {
    let output = '✅ Your To-Do List:\n\n';
    
    const prioritized = this.prioritizeTodos(todos);
    
    prioritized.forEach((todo, i) => {
      const checkbox = todo.completed ? '[x]' : '[ ]';
      const priorityEmoji = {
        urgent: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[todo.priority];
      
      output += `${i + 1}. ${checkbox} ${priorityEmoji} ${todo.title}\n`;
      if (todo.description) {
        output += `   ${todo.description}\n`;
      }
      if (todo.dueDate) {
        output += `   📅 Due: ${format(new Date(todo.dueDate), 'MMM dd, h:mm a')}\n`;
      }
      if (todo.estimatedTime) {
        output += `   ⏱️  Est. ${todo.estimatedTime} min\n`;
      }
      output += '\n';
    });

    return output;
  }
}

// ============================================================================
// RESOURCE LOOKUP TOOL - Fetch campus resources from DB
// ============================================================================

export class ResourceLookupTool {
  /**
   * Search campus resources by category
   */
  static async searchByCategory(category: string): Promise<any[]> {
    try {
      const resources = await prisma.campusResource.findMany({
        where: {
          category: {
            contains: category,
          },
        },
        take: 10,
      });
      
      return resources;
    } catch (error) {
      console.error('Resource lookup error:', error);
      return [];
    }
  }

  /**
   * Search resources by tags/keywords
   */
  static async searchByTags(tags: string[]): Promise<any[]> {
    try {
      // For SQLite, we need to search differently since hasSome doesn't work with comma-separated strings
      const resources = await prisma.campusResource.findMany({
        where: {
          OR: tags.map(tag => ({
            tags: {
              contains: tag,
            },
          })),
        },
        take: 10,
      });
      
      return resources;
    } catch (error) {
      console.error('Resource lookup error:', error);
      return [];
    }
  }

  /**
   * Get all resources of a specific category
   */
  static async getByCategory(category: string): Promise<any[]> {
    try {
      return await prisma.campusResource.findMany({
        where: { category },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Resource lookup error:', error);
      return [];
    }
  }

  /**
   * Format resources for display
   */
  static formatResources(resources: any[]): string {
    if (resources.length === 0) {
      return '❌ No resources found matching your criteria.';
    }

    let output = `📚 Found ${resources.length} Resource(s):\n\n`;
    
    resources.forEach((resource, i) => {
      output += `${i + 1}. **${resource.name}**\n`;
      output += `   ${resource.description}\n`;
      if (resource.location) {
        output += `   📍 Location: ${resource.location}\n`;
      }
      if (resource.contactInfo) {
        output += `   📞 Contact: ${resource.contactInfo}\n`;
      }
      if (resource.website) {
        output += `   🌐 Website: ${resource.website}\n`;
      }
      if (resource.hours) {
        output += `   🕒 Hours: ${resource.hours}\n`;
      }
      output += '\n';
    });

    return output;
  }
}

// ============================================================================
// PROFILE TOOL - Retrieve user data for personalization
// ============================================================================

export class ProfileTool {
  /**
   * Get user profile with preferences
   */
  static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });
      
      return user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  /**
   * Get recent advice logs for context
   */
  static async getRecentAdvice(userId: string, limit: number = 5): Promise<any[]> {
    try {
      return await prisma.adviceLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Advice logs fetch error:', error);
      return [];
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(
    userId: string, 
    limit: number = 10
  ): Promise<any[]> {
    try {
      return await prisma.message.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Message history fetch error:', error);
      return [];
    }
  }

  /**
   * Format profile for agent context
   */
  static formatProfileContext(user: any): string {
    if (!user) return 'User profile not available.';

    const profile = user.profile;
    if (!profile) return `User: ${user.name} (${user.email})`;

    let context = `**User Profile:**\n`;
    context += `- Name: ${user.name}\n`;
    if (profile.major) context += `- Major: ${profile.major}\n`;
    if (profile.year) context += `- Year: ${profile.year}\n`;
    if (profile.interests?.length > 0) {
      context += `- Interests: ${profile.interests.join(', ')}\n`;
    }
    if (profile.stressLevel) context += `- Stress Level: ${profile.stressLevel}\n`;
    if (profile.goals) context += `- Goals: ${profile.goals}\n`;

    return context;
  }
}
