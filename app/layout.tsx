import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './styles/mobile-v2.css'; // Import Mobile V2 styles
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { I18nProviderWrapper } from './providers';
import ServiceWorker from './components/ServiceWorker';
import { Metadata } from 'next';

// File: app/layout.tsx

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

const minion = localFont({
  src: '../public/fonts/MinionPro-Regular.otf',
  variable: '--font-minion',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev'),
  title: {
    default: 'Galeon Hospitals Map - Interactive Healthcare Network',
    template: '%s | Galeon Hospitals Map'
  },
  description: 'Explore the interactive map of Galeon community hospitals across France. Real-time deployment tracking, multilingual support, and comprehensive hospital information.',
  keywords: [
    'Galeon',
    'hospitals',
    'healthcare',
    'France',
    'interactive map',
    'medical facilities',
    'hospital network',
    'healthcare technology',
    'medical deployment'
  ],
  authors: [{ name: 'Galeon Community' }],
  creator: 'Galeon Community',
  publisher: 'Galeon',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR'],
    url: '/',
    title: 'Galeon Hospitals Map - Interactive Healthcare Network',
    description: 'Explore the interactive map of Galeon community hospitals across France. Real-time deployment tracking and comprehensive hospital information.',
    siteName: 'Galeon Hospitals Map',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Galeon Hospitals Map - Interactive Healthcare Network',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@GaleonCare',
    creator: '@GaleonCare',
    title: 'Galeon Hospitals Map - Interactive Healthcare Network',
    description: 'Explore the interactive map of Galeon community hospitals across France.',
    images: ['/images/og-image.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: 'healthcare',
  classification: 'Healthcare Technology',
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#3b82f6',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Galeon Hospitals" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Galeon Hospitals Map',
              description: 'Interactive map of Galeon community hospitals across France',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              author: {
                '@type': 'Organization',
                name: 'Galeon Community',
                url: 'https://www.galeon.care/',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Galeon',
                url: 'https://www.galeon.care/',
                logo: {
                  '@type': 'ImageObject',
                  url: '/logo-white.svg',
                },
              },
            }),
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://events.mapbox.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/MinionPro-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/logo-white.svg" as="image" />
        
        {/* Critical CSS will be injected by critical-css.ts */}
        <style id="critical-css-placeholder" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} ${minion.variable} antialiased overflow-x-hidden max-w-full`}
      >
        <I18nProviderWrapper>
          {children}
          <Toaster />
          <ServiceWorker />
        </I18nProviderWrapper>
      </body>
    </html>
  );
}
