import { HospitalStatus } from './hospital';

export interface FilterState {
  statuses: HospitalStatus[];
  searchTerm: string;
  country: string;
  city: string;
  region: string;
}

export interface Region {
  value: string;
  label: string;
}

export interface FilterOptions {
  countries: string[];
  cities: string[];
  regions: Region[];
}

export interface SearchFilters {
  term: string;
  field: 'name' | 'address' | 'all';
}

export interface FilterStats {
  total: number;
  filtered: number;
  byStatus: Record<HospitalStatus, number>;
  byRegion: Record<string, number>;
}