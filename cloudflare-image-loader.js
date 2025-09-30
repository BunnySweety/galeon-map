// Loader d'images personnalisé pour Cloudflare
export default function cloudflareImageLoader({ src, width, quality }) {
  // Vérifier si l'URL est déjà absolue
  if (src.startsWith('http')) {
    // Pour les images externes, utiliser Cloudflare Image Resizing si possible
    if (src.includes('galeon.community')) {
      const url = new URL(src);
      // Appliquer les paramètres de redimensionnement de Cloudflare
      return `${url.origin}/cdn-cgi/image/width=${width},quality=${quality || 75},format=auto${url.pathname}`;
    }
    // Sinon, retourner l'URL d'origine
    return src;
  }

  // Pour les images locales
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_BASE_URL || '';
  const params = new URLSearchParams({
    width: width.toString(),
    quality: (quality || 75).toString(),
    format: 'auto',
  });

  // Construire l'URL avec le service d'images de Cloudflare
  return `${baseUrl}/cdn-cgi/image/${params.toString()}${src.startsWith('/') ? src : `/${src}`}`;
}
