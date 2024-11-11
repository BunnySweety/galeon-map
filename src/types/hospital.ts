export type HospitalStatus = 'Deployed' | 'In Progress' | 'Signed';

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: HospitalStatus;
  address: string;
  website?: string;
  imageUrl?: string;
}

export interface HospitalStatistics {
  totalCount: number;
  deployedCount: number;
  inProgressCount: number;
  signedCount: number;
  byRegion: Record<string, number>;
  byCountry: Record<string, number>;
}

export interface HospitalFilters {
  statuses: HospitalStatus[];
  searchTerm: string;
  country: string;
  city: string;
  region: string;
}

export interface HospitalMarker extends L.CircleMarker {
  hospitalData?: Hospital;
}