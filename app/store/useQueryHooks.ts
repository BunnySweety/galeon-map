// File: app/store/useQueryHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Hospital } from './useMapStore';

// Hook for fetching all hospitals
export function useHospitalsQuery() {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await fetch('/api/hospitals');
      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }
      return response.json() as Promise<Hospital[]>;
    },
  });
}

// Hook for fetching a single hospital
export function useHospitalQuery(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      const response = await fetch(`/api/hospitals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hospital');
      }
      return response.json() as Promise<Hospital>;
    },
    enabled: !!id, // Only run if an ID is provided
  });
}

// Hook for adding a new hospital
export function useAddHospitalMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newHospital: Omit<Hospital, 'id'>) => {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHospital),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add hospital');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query cache to refetch hospitals
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
}

// Hook for updating a hospital
export function useUpdateHospitalMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedHospital: Hospital) => {
      const response = await fetch(`/api/hospitals/${updatedHospital.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHospital),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update hospital');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['hospital', variables.id] });
    },
  });
}

// Hook for deleting a hospital
export function useDeleteHospitalMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/hospitals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete hospital');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the query cache to refetch hospitals
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
}