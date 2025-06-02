import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Tag, InsertTag } from '../types';

export function useTags() {
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiService.getTags(),
  });

  const createTagMutation = useMutation({
    mutationFn: (data: InsertTag) => apiService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTag> }) =>
      apiService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    isError: tagsQuery.isError,
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  };
}

export function useListTags(listId: number) {
  const queryClient = useQueryClient();

  const listTagsQuery = useQuery({
    queryKey: ['lists', listId, 'tags'],
    queryFn: () => apiService.getListTags(listId),
    enabled: !!listId,
  });

  const addTagMutation = useMutation({
    mutationFn: (tagId: number) => apiService.addTagToList(listId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'tags'] });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: (tagId: number) => apiService.removeTagFromList(listId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'tags'] });
    },
  });

  return {
    tags: listTagsQuery.data || [],
    isLoading: listTagsQuery.isLoading,
    addTag: addTagMutation.mutate,
    removeTag: removeTagMutation.mutate,
    isAdding: addTagMutation.isPending,
    isRemoving: removeTagMutation.isPending,
  };
}