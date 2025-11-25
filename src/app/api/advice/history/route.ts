/**
 * Advice History API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: session.user.id };
    if (category) {
      where.category = category;
    }

    const adviceLogs = await prisma.adviceLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      advice: adviceLogs,
    });
  } catch (error) {
    console.error('Advice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advice' },
      { status: 500 }
    );
  }
}
