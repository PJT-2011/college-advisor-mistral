/**
 * User Profile API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  name: z.string().optional(),
  major: z.string().optional().nullable(),
  year: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).optional().nullable().or(z.literal('')),
  interests: z.array(z.string()).optional(),
  stressLevel: z.union([
    z.enum(['low', 'medium', 'high']),
    z.string(),
    z.number().min(0).max(10)
  ]).optional().nullable(),
  goals: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Profile update request:', body);
    
    const data = profileSchema.parse(body);

    // Update user
    const updateData: any = {};
    if (data.name) updateData.name = data.name;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });
    }

    // Update profile
    const profileData: any = {};
    if (data.major !== undefined) profileData.major = data.major || null;
    if (data.year !== undefined) profileData.year = data.year || null;
    if (data.interests !== undefined) {
      // Handle interests array - convert to comma-separated string or null
      profileData.interests = data.interests && data.interests.length > 0 
        ? data.interests.join(', ') 
        : null;
    }
    if (data.stressLevel !== undefined) {
      // Convert to string if it's a number
      profileData.stressLevel = typeof data.stressLevel === 'number' 
        ? data.stressLevel.toString() 
        : data.stressLevel || null;
    }
    if (data.goals !== undefined) profileData.goals = data.goals || null;

    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: profileData,
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser!;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
