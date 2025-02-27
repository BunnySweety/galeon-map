// File: app/api/hospitals/route.ts
import { NextResponse } from 'next/server';
import { hospitals, HospitalSchema, HospitalsSchema } from './data';

// GET handler for fetching all hospitals
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  let filteredHospitals = hospitals;
  
  // Filter by status if provided
  if (status) {
    const statuses = status.split(',');
    filteredHospitals = hospitals.filter(hospital => 
      statuses.includes(hospital.status)
    );
  }
  
  // Validate the hospitals array before sending it
  // This ensures the response conforms to our schema
  const validationResult = HospitalsSchema.safeParse(filteredHospitals);
  if (!validationResult.success) {
    console.error("Hospital data validation error:", validationResult.error);
    return NextResponse.json(
      { error: 'Internal server error: Invalid hospital data format' },
      { status: 500 }
    );
  }
  
  return NextResponse.json(filteredHospitals);
}

// POST handler for adding a new hospital (in a real app would add to database)
export async function POST(request: Request) {
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
      { success: true, message: 'Hospital would be created in a real app' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Utilisez l'erreur capturée
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage },
      { status: 500 }
    );
  }
}

// Endpoint pour recevoir plusieurs hôpitaux en une seule requête
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Utiliser HospitalsSchema pour valider le tableau d'hôpitaux
    const result = HospitalsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid hospitals data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Dans une vraie application, vous sauvegarderiez ces hôpitaux en base de données
    return NextResponse.json(
      { success: true, count: body.length, message: 'Hospitals would be updated in a real app' }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process batch update', details: errorMessage },
      { status: 500 }
    );
  }
}