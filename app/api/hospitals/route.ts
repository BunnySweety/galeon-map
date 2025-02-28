// File: app/api/hospitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hospitals } from './data';

export async function GET(_request: NextRequest) {
  return NextResponse.json(hospitals);
}