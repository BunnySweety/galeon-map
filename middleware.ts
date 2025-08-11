// File: middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Version simplifiée pour éviter les boucles infinies
export function middleware(request: NextRequest) {
  // Seulement traiter les requêtes d'API pour éviter les boucles
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Ajouter les en-têtes CORS pour les API
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }

  // Pour toutes les autres requêtes, simplement passer au handler suivant
  return NextResponse.next();
}

export const config = {
  // Limiter le middleware aux routes API pour éviter les boucles
  matcher: ['/api/:path*'],
};
