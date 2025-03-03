// File: app/hospitals/[id]/page.tsx
import { hospitals } from '../../api/hospitals/data';
import HospitalDetailClient from './HospitalDetailClient';

// Cette fonction est nécessaire pour l'export statique
// Elle génère tous les chemins possibles pour cette page dynamique
export async function generateStaticParams() {
  // Retourne un tableau d'objets avec les paramètres pour chaque chemin
  return hospitals.map((hospital) => ({
    id: hospital.id,
  }));
}

// Définir que cette page est statique
export const dynamic = 'force-static';
export const revalidate = false;

export default function HospitalDetailPage({ params }: { params: { id: string } }) {
  const hospitalId = params.id;
  
  return <HospitalDetailClient hospitalId={hospitalId} />;
}