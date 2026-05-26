import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService } from '../services/professionalService';
import type { ProfessionalUpdateDto } from '../types';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export function useProfessionals(page = 1, limit = 10, search = '') {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ['admin-professionals', page, limit, search],
    queryFn: () => professionalService.getProfessionals(page, limit, search),
    placeholderData: (previousData) => previousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: ProfessionalUpdateDto }) => 
      professionalService.updateProfessional(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-professionals'] });
      Swal.fire({
        title: t('sharedPages.admin.updated'),
        text: t('sharedPages.admin.updatedMsg'),
        icon: 'success',
        confirmButtonColor: 'var(--primary-500)'
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: t('sharedPages.admin.error'),
        text: error?.response?.data?.message || t('sharedPages.admin.errorMsg'),
        icon: 'error',
        confirmButtonColor: 'var(--primary-500)'
      });
    }
  });

  return {
    ...query,
    updateProfessional: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
}
