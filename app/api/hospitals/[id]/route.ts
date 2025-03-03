// File: app/api/hospitals/[id]/route.ts
import { NextResponse } from 'next/server';
import { hospitals, HospitalSchema, Hospital } from './data';

// Indiquer à Next.js que cette route est statique
export const dynamic = 'force-static';
export const revalidate = false;

// Générer les paramètres statiques pour cette route
export async function generateStaticParams() {
  return hospitals.map((hospital) => ({
    id: hospital.id,
  }));
}

export async function GET(
  request: Request
) {
  try {
    // Extraire l'ID de l'URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
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

// Les méthodes PUT et DELETE ne sont pas compatibles avec l'export statique
// Nous les commentons pour l'instant
/*
export async function PUT(
  request: Request
) {
  try {
    // Extraire l'ID de l'URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const body = await request.json();
    
    const result = HospitalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid hospital data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const hospitalIndex = hospitals.findIndex((h: Hospital) => h.id === id);
    if (hospitalIndex === -1) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }
    
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

export async function DELETE(
  request: Request
) {
  try {
    // Extraire l'ID de l'URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const hospitalIndex = hospitals.findIndex((h: Hospital) => h.id === id);
    if (hospitalIndex === -1) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Hospital would be deleted in a real app' }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
*/