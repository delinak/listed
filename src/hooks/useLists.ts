import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { List, InsertList } from '../types';

export function useLists() {
  const queryClient = useQueryClient();

  const listsQuery = useQuery({
    queryKey: ['lists'],
    queryFn: () => apiService.getLists(),
  });

  const createListMutation = useMutation({
    mutationFn: (data: InsertList) => apiService.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertList }) =>
      apiService.updateList({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  return {
    lists: listsQuery.data || [],
    isLoading: listsQuery.isLoading,
    isError: listsQuery.isError,
    createList: createListMutation.mutate,
    updateList: updateListMutation.mutate,
    deleteList: deleteListMutation.mutate,
    isCreating: createListMutation.isPending,
    isUpdating: updateListMutation.isPending,
    isDeleting: deleteListMutation.isPending,
  };
}

export function useList(id: number) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => apiService.getList(id),
    enabled: !!id,
  });
}