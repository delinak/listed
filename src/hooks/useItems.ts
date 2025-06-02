import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Item, InsertItem } from '../types';

export function useItems(listId: number) {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['items', listId],
    queryFn: () => apiService.getItems(listId),
  });

  const createItem = useMutation({
    mutationFn: (data: InsertItem) => apiService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertItem }) =>
      apiService.updateItem({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', listId] });
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem: createItem.mutateAsync,
    updateItem: updateItem.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
    isCreating: createItem.isPending,
    isUpdating: updateItem.isPending,
    isDeleting: deleteItem.isPending,
  };
}