'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import logger from '../utils/logger';

// Context pour le store lazy
const LazyStoreContext = createContext<any>(null);

interface LazyStoreProviderProps {
  children: ReactNode;
}

export function LazyStoreProvider({ children }: LazyStoreProviderProps) {
  const [store, setStore] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const { useMapStore } = await import('./useMapStore');
        setStore(useMapStore);
        setIsLoaded(true);
      } catch (error) {
        logger.error('Failed to load store:', error);
        setIsLoaded(true);
      }
    };

    loadStore();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <LazyStoreContext.Provider value={store}>
      {children}
    </LazyStoreContext.Provider>
  );
}

// Hook pour utiliser le store lazy
export function useLazyMapStore() {
  const store = useContext(LazyStoreContext);
  if (!store) {
    throw new Error('useLazyMapStore must be used within LazyStoreProvider');
  }
  return store();
}

// Hook pour charger le store de manière conditionnelle
export function useConditionalStore(condition: boolean = true) {
  const [store, setStore] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(!condition);

  useEffect(() => {
    if (!condition) return;

    const loadStore = async () => {
      try {
        const { useMapStore } = await import('./useMapStore');
        setStore(() => useMapStore);
        setIsLoaded(true);
      } catch (error) {
        logger.error('Failed to load conditional store:', error);
        setIsLoaded(true);
      }
    };

    loadStore();
  }, [condition]);

  return { store: store ? store() : null, isLoaded };
} 