// File: app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProviderWrapper } from './providers';
import './uno.css'
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });
const minion = localFont({ 
  src: '../public/fonts/MinionPro-Regular.otf',
  variable: '--font-minion'
});

export const metadata: Metadata = {
  title: "Galeon Hospitals Map",
  description: "Interactive map of hospital deployments",
  icons: {
    icon: '/favicon.png',
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
        <link rel="icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} ${minion.variable} antialiased`}
      >
        <I18nProviderWrapper>
          {children}
        </I18nProviderWrapper>
      </body>
    </html>
  );
}