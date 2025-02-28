// File: app/api/hospitals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hospitals, HospitalSchema, Hospital } from '../data';

// GET handler for fetching a specific hospital
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    // Simuler un délai de réponse
    await new Promise(resolve => setTimeout(resolve, 1000));

    const hospital = hospitals.find((h: Hospital) => h.id === id);
    
    if (!hospital) {
      return NextResponse.json(
        { error: "Hôpital non trouvé" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hospital);
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// PUT handler for updating a hospital
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate the hospital data
    const result = HospitalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid hospital data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Check if hospital exists
    const hospitalIndex = hospitals.findIndex((h: Hospital) => h.id === id);
    if (hospitalIndex === -1) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }
    
    // In a real app, this would update the database
    // For this example, we'll just return success
    return NextResponse.json(
      { success: true, message: 'Hospital would be updated in a real app' }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a hospital
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Check if hospital exists
  const hospitalIndex = hospitals.findIndex((h: Hospital) => h.id === id);
  if (hospitalIndex === -1) {
    return NextResponse.json(
      { error: 'Hospital not found' },
      { status: 404 }
    );
  }
  
  // In a real app, this would remove from the database
  // For this example, we'll just return success
  return NextResponse.json(
    { success: true, message: 'Hospital would be deleted in a real app' }
  );
}