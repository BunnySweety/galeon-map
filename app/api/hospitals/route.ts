import { NextResponse } from 'next/server';
import { hospitals } from './data';

// Indiquer à Next.js que cette route est statique
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    return NextResponse.json(hospitals);
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 