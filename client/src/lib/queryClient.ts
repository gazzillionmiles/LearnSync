import { QueryClient } from '@tanstack/react-query';
import api from './api';

// Helper function to make API requests
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await api.request({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Clear token but don't redirect
      localStorage.removeItem('token');
    }
    throw error;
  }
};

// Helper function to get query function
export const getQueryFn = async <T>(
  endpoint: string,
  throwOnUnauthorized = true
): Promise<T | null> => {
  try {
    const response = await api.get<T>(endpoint);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      if (throwOnUnauthorized) {
        // Clear token but don't redirect
        localStorage.removeItem('token');
      }
      return null;
    }
    throw error;
  }
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache is kept for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch when reconnecting
      queryFn: ({ queryKey }) => getQueryFn(queryKey[0] as string),
    },
  },
});
