'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Hospital } from '../../api/hospitals/data';

interface MobileContextType {
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filters: {
    deployed: boolean;
    signed: boolean;
  };
  toggleFilter: (filter: 'deployed' | 'signed') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'compact' | 'detailed';
  setViewMode: (mode: 'compact' | 'detailed') => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: ReactNode }) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    deployed: true,
    signed: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const toggleFilter = useCallback((filter: 'deployed' | 'signed') => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  }, []);

  return (
    <MobileContext.Provider
      value={{
        selectedHospital,
        setSelectedHospital,
        isFilterOpen,
        setIsFilterOpen,
        filters,
        toggleFilter,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileContext() {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobileContext must be used within MobileProvider');
  }
  return context;
}
