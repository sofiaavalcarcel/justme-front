import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import type { PlatformSettings } from '../types';
import { useNotification } from '../../../context/NotificationContext';

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  const query = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => settingsService.getSettings()
  });

  const mutation = useMutation({
    mutationFn: (settings: PlatformSettings) => settingsService.saveSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      notify('success', 'Configuración guardada', 'Los ajustes de la plataforma se han actualizado correctamente.');
    }
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    saveSettings: mutation.mutate
  };
}
