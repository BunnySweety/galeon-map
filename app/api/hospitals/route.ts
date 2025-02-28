// File: app/api/hospitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hospitals, HospitalSchema, Hospital } from './data';

export async function GET(request: NextRequest) {
  try {
    // Check for query parameters to filter results
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    if (status) {
      const filteredHospitals = hospitals.filter(
        hospital => hospital.status.toLowerCase() === status.toLowerCase()
      );
      return NextResponse.json(filteredHospitals);
    }
    
    return NextResponse.json(hospitals);
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the hospital data
    const result = HospitalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid hospital data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // In a real app, this would add to the database
    // For this example, we'll just return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Hospital would be added in a real app',
        data: result.data
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}