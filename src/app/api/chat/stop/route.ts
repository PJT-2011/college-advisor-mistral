/**
 * Stop Chat Generation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMistralService } from '@/lib/mistral';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Stop the ongoing generation
    const mistral = getMistralService();
    mistral.stopGeneration();

    return NextResponse.json({
      success: true,
      message: 'Generation stopped',
    });
  } catch (error) {
    console.error('Stop generation error:', error);
    return NextResponse.json(
      { error: 'Failed to stop generation' },
      { status: 500 }
    );
  }
}
