'use client';

// ============================================================
// QueryProvider — TanStack React Query client provider
// Wraps the app with QueryClientProvider for server state management
// ============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider creates a QueryClient instance and provides it
 * to the component tree via QueryClientProvider.
 * The client is created once per mount (not per render) to preserve cache.
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
