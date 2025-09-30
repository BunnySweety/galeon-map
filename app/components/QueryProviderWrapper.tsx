'use client';

import { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import logger from '../utils/logger';

// Dynamic import du QueryClient
const QueryClientProvider = dynamic(
  () => import('@tanstack/react-query').then(mod => ({ default: mod.QueryClientProvider })),
  { ssr: false }
);

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => ({ default: mod.ReactQueryDevtools })),
  { ssr: false }
);

interface QueryProviderWrapperProps {
  children: ReactNode;
  enableQuery?: boolean;
}

export default function QueryProviderWrapper({ 
  children, 
  enableQuery = false 
}: QueryProviderWrapperProps) {
  const [queryClient, setQueryClient] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(!enableQuery);

  useEffect(() => {
    if (!enableQuery) return;

    const loadQueryClient = async () => {
      try {
        const { QueryClient } = await import('@tanstack/react-query');
        const client = new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000,
              refetchOnWindowFocus: false,
            },
          },
        });
        setQueryClient(client);
        setIsLoaded(true);
      } catch (error) {
        logger.error('Failed to load QueryClient:', error);
        setIsLoaded(true);
      }
    };

    loadQueryClient();
  }, [enableQuery]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!enableQuery || !queryClient) {
    return <>{children}</>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
} 