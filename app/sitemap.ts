import { MetadataRoute } from 'next';
import { hospitals } from './api/hospitals/data';

export const dynamic = 'force-static';
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://galeon-community-map.pages.dev';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Dynamic hospital pages
  const hospitalPages: MetadataRoute.Sitemap = hospitals.map((hospital) => ({
    url: `${baseUrl}/hospitals/${hospital.id}`,
    lastModified: new Date(hospital.deploymentDate),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...hospitalPages];
} 