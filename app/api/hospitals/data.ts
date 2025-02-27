// File: app/api/hospitals/data.ts
import { z } from 'zod';

// Hospital schema validation
export const HospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['Deployed', 'Signed']),
  deploymentDate: z.string(),
  website: z.string().url(),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string(),
  imageUrl: z.string(),
});

export type Hospital = z.infer<typeof HospitalSchema>;

// Schema for an array of hospitals
export const HospitalsSchema = z.array(HospitalSchema);
export type Hospitals = z.infer<typeof HospitalsSchema>;

// Sample data - in production this would come from a database
export const hospitals: Hospital[] = [
  {
    id: '1',
    name: 'Châlon-sur-Saône Hospital',
    status: 'Deployed',
    deploymentDate: '2023-06-15',
    website: 'https://www.ch-chalon71.fr',
    coordinates: [4.85, 46.78],
    address: 'Châlon-sur-Saône, France',
    imageUrl: '/images/hospital1.jpg',
  },
  {
    id: '2',
    name: 'Toulon Hospital',
    status: 'Deployed',
    deploymentDate: '2023-09-20',
    website: 'https://www.ch-toulon.fr',
    coordinates: [5.93, 43.12],
    address: 'Toulon, France',
    imageUrl: '/images/hospital2.jpg',
  },
  {
    id: '3',
    name: 'Hyères Hospital',
    status: 'Deployed',
    deploymentDate: '2023-08-15',
    website: 'https://www.ch-hyeres.fr',
    coordinates: [6.12, 43.12],
    address: 'Hyères, France',
    imageUrl: '/images/hospital3.jpg',
  },
  {
    id: '4',
    name: 'Caen Normandy University Hospital',
    status: 'Deployed',
    deploymentDate: '2023-07-10',
    website: 'https://www.chu-caen.fr',
    coordinates: [-0.37, 49.18],
    address: 'Caen, France',
    imageUrl: '/images/hospital4.jpg',
  },
  {
    id: '5',
    name: 'South Francilian Hospital',
    status: 'Deployed',
    deploymentDate: '2023-11-05',
    website: 'https://www.chsf.fr',
    coordinates: [2.48, 48.63],
    address: 'Corbeil-Essonnes, France',
    imageUrl: '/images/hospital5.jpg',
  },
  {
    id: '6',
    name: 'North-Essonne Hospital Group - Longjumeau Site',
    status: 'Deployed',
    deploymentDate: '2024-02-01',
    website: 'https://www.gh-nord-essonne.fr',
    coordinates: [2.28, 48.69],
    address: 'Longjumeau, France',
    imageUrl: '/images/hospital6.jpg',
  },
  {
    id: '7',
    name: 'North-Essonne Hospital Group - Orsay Site',
    status: 'Deployed',
    deploymentDate: '2024-02-01',
    website: 'https://www.gh-nord-essonne.fr',
    coordinates: [2.18, 48.7],
    address: 'Orsay, France',
    imageUrl: '/images/hospital7.jpg',
  },
  {
    id: '8',
    name: 'Jean Leclaire Hospital',
    status: 'Deployed',
    deploymentDate: '2023-08-20',
    website: 'https://www.ch-sarlat.fr',
    coordinates: [1.21, 44.89],
    address: 'Sarlat, France',
    imageUrl: '/images/hospital8.jpg',
  },
  {
    id: '9',
    name: 'Samuel Pozzi Hospital',
    status: 'Deployed',
    deploymentDate: '2023-10-15',
    website: 'https://www.ch-bergerac.fr',
    coordinates: [0.48, 44.85],
    address: 'Bergerac, France',
    imageUrl: '/images/hospital9.jpg',
  },
  {
    id: '10',
    name: 'CHU Rouen',
    status: 'Signed',
    deploymentDate: '2023-06-01',
    website: 'https://www.chu-rouen.fr',
    coordinates: [1.11, 49.44],
    address: 'Rouen, France',
    imageUrl: '/images/hospital10.jpg',
  },
];