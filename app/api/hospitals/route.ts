import { NextResponse } from 'next/server';
import { hospitals } from './data';

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