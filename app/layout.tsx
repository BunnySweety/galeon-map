import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { I18nProviderWrapper } from './providers';
import ServiceWorker from './components/ServiceWorker';

// File: app/layout.tsx

// Use only Inter as main font (modern, clean, good readability)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  preload: true,
});

// Keep MinionPro for branding/specific elements only, with optimized loading
const minion = localFont({
  src: '../public/fonts/MinionPro-Regular.otf',
  variable: '--font-minion',
  display: 'swap',
  weight: '400',
  preload: false, // Load only when needed
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://galeon-community-map.pages.dev'
  ),
  title: {
    default: 'Galeon Hospitals Map - Interactive Healthcare Network',
    template: '%s | Galeon Hospitals Map',
  },
  description:
    'Explore the interactive map of Galeon community hospitals across France. Real-time deployment tracking, multilingual support, and comprehensive hospital information.',
  keywords: [
    'Galeon',
    'hospitals',
    'healthcare',
    'France',
    'interactive map',
    'medical facilities',
    'hospital network',
    'healthcare technology',
    'medical deployment',
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
    description:
      'Explore the interactive map of Galeon community hospitals across France. Real-time deployment tracking and comprehensive hospital information.',
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
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' }],
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
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_APP_URL ?? 'https://galeon-community-map.pages.dev'}
        />
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
              url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://galeon-community-map.pages.dev',
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
        <link
          rel="preload"
          href="/fonts/MinionPro-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/logo-white.svg" as="image" />

        {/* Placeholder for future critical CSS if needed */}
      </head>
      <body className={`${inter.className} ${inter.variable} ${minion.variable} antialiased`}>
        <I18nProviderWrapper>
          {children}
          <Toaster />
          <ServiceWorker />
        </I18nProviderWrapper>
      </body>
    </html>
  );
}
