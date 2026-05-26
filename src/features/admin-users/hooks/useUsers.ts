import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UserUpdateDto } from '../types';
import Swal from 'sweetalert2';

export function useUsers(page = 1, limit = 10, search = '') {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', page, limit, search],
    queryFn: () => userService.getUsers(page, limit, search),
    // Mantener los datos anteriores mientras se cargan los nuevos para evitar saltos en la UI
    placeholderData: (previousData) => previousData,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateDto }) => 
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo actualizar el usuario'
      });
    }
  });

  return {
    ...query,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
}
