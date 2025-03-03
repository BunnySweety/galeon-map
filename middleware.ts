import { NextRequest, NextResponse } from 'next/server';

// Langues supportées
const locales = ['en', 'fr'];
const defaultLocale = 'en';

// Fonction pour obtenir la locale depuis les cookies, les headers Accept-Language, ou la locale par défaut
function getLocale(request: NextRequest): string {
  // Vérifier si une locale est déjà définie dans les cookies
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Vérifier les headers Accept-Language
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => locales.includes(lang.substring(0, 2)));
    
    if (preferredLocale) {
      return preferredLocale.substring(0, 2);
    }
  }

  // Utiliser la locale par défaut
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Gérer les fichiers statiques
  if (pathname.startsWith('/_next/') || 
      pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return NextResponse.next();
  }

  // Gérer les routes API statiques
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Gérer les routes dynamiques
  if (pathname.match(/^\/hospitals\/[^\/]+$/)) {
    return NextResponse.next();
  }

  // Gérer la page d'accueil
  if (pathname === '/' || pathname === '') {
    // Obtenir la locale
    const locale = getLocale(request);
    
    // Créer une nouvelle réponse
    const response = NextResponse.next();
    
    // Définir la locale dans un cookie pour les futures requêtes
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 an
    });
    
    return response;
  }

  // Rediriger vers la page d'accueil si la route n'est pas reconnue
  if (!pathname.startsWith('/_next') && 
      !pathname.startsWith('/api') && 
      !pathname.match(/\.[a-zA-Z0-9]+$/)) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher pour les routes à intercepter
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 