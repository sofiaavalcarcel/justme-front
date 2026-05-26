import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceCategoryService } from '../services/serviceCategoryService';
import type { ServiceCategoryDto } from '../types';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export function useServiceCategories() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ['admin-service-categories'],
    queryFn: () => serviceCategoryService.getCategories()
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceCategoryDto) => serviceCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-categories'] });
      Swal.fire({
        title: t('sharedPages.admin.updated'), // Reusing common translations
        text: 'Categoría creada con éxito',
        icon: 'success',
        confirmButtonColor: 'var(--primary-500)'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ServiceCategoryDto }) => 
      serviceCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-categories'] });
      Swal.fire({
        title: t('sharedPages.admin.updated'),
        text: t('sharedPages.admin.updatedMsg'),
        icon: 'success',
        confirmButtonColor: 'var(--primary-500)'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-categories'] });
      Swal.fire({
        title: t('sharedPages.admin.deleted'),
        text: t('sharedPages.admin.deletedMsg'),
        icon: 'success',
        confirmButtonColor: 'var(--primary-500)'
      });
    }
  });

  return {
    ...query,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}
