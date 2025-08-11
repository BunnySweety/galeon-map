// File: app/hospitals/[id]/page.tsx
import { hospitals } from '../../api/hospitals/data';
import HospitalPageClient from './HospitalPageClient';

interface HospitalPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Génération statique des paramètres
export async function generateStaticParams() {
  return hospitals.map((hospital) => ({
    id: hospital.id,
  }));
}

// Métadonnées dynamiques
export async function generateMetadata({ params }: HospitalPageProps) {
  const { id } = await params;
  const hospital = hospitals.find(h => h.id === id);
  
  if (!hospital) {
    return {
      title: 'Hospital Not Found - Galeon',
      description: 'The requested hospital could not be found.',
    };
  }

  return {
    title: `${hospital.nameEn} - Galeon Hospital Map`,
    description: `Details for ${hospital.nameEn}, deployed on ${hospital.deploymentDate}. View location, contact information, and more.`,
    keywords: ['hospital', 'galeon', 'healthcare', hospital.nameEn],
    openGraph: {
      title: `${hospital.nameEn} - Galeon`,
      description: `Hospital details for ${hospital.nameEn}`,
      type: 'website',
      images: [
        {
          url: hospital.imageUrl,
          width: 1200,
          height: 630,
          alt: hospital.nameEn,
        },
      ],
    },
  };
}

export default async function HospitalPage({ params }: HospitalPageProps) {
  const { id } = await params;
  return <HospitalPageClient hospitalId={id} />;
}
