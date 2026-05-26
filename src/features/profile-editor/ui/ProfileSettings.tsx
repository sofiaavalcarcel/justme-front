import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../entities/session/model/store';
import { apiClient } from '../../../shared/api/axiosClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Loader2, Settings, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { AddressManager, type Address } from './AddressManager';

// Esquema de validación estricta Zod
const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileSettings = () => {
  const { user, login, token, logout } = useAuthStore();
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Obtener direcciones del servidor
  const { data: addresses } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Address[] }>(`/users/${user?.id}/addresses`);
      return data.data;
    },
    enabled: !!user?.id,
  });

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '', // Añadir propiedad phone en el User del AuthStore en caso de integrarlo
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.patch(`/users/${user?.id}/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (response) => {
      if (user && token) {
        // Actualizar Zustand store
        login({ ...user, ...response.data }, token);
      }
      setSelectedFile(null); // Reset archivo después de subido
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    if (values.phone) formData.append('phone', values.phone);
    if (selectedFile) formData.append('profileImage', selectedFile);
    
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Cabecera con Radix Dropdown para el perfil */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Perfil</h1>
        
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center space-x-2 bg-white border px-3 py-2 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E34234]">
              <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                <Avatar.Image src={user?.profileImage} className="w-full h-full object-cover" />
                <Avatar.Fallback className="flex items-center justify-center w-full h-full text-xs font-bold text-[#E34234]">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar.Fallback>
              </Avatar.Root>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md p-1 shadow-lg border animate-in fade-in zoom-in-95" sideOffset={5}>
              <DropdownMenu.Label className="px-2 py-2 text-xs font-semibold text-gray-500">
                Mi Cuenta ({user?.email})
              </DropdownMenu.Label>
              <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-[#FFF1F0] hover:text-[#E34234] rounded cursor-pointer outline-none">
                <UserIcon size={16} className="mr-2" /> Ver Perfil
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-[#FFF1F0] hover:text-[#E34234] rounded cursor-pointer outline-none">
                <Settings size={16} className="mr-2" /> Ajustes
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-[1px] bg-gray-200 m-1" />
              <DropdownMenu.Item 
                onClick={() => logout()}
                className="flex items-center px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none font-medium"
              >
                <LogOut size={16} className="mr-2" /> Cerrar Sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna Izquierda: Formulario Principal */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
              <Avatar.Root className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-[#E34234] shrink-0">
                <Avatar.Image src={previewImage || undefined} className="w-full h-full object-cover" />
                <Avatar.Fallback className="flex items-center justify-center w-full h-full text-2xl font-bold text-gray-400">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="flex flex-col space-y-2">
                <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 text-center transition-colors">
                  Subir Nueva Foto
                  <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} />
                </label>
                <p className="text-xs text-gray-500">JPG, PNG o WebP. Máx 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  {...register('firstName')} 
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#E34234] focus:border-transparent'}`}
                />
                {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Apellido</label>
                <input 
                  {...register('lastName')} 
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#E34234] focus:border-transparent'}`}
                />
                {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Teléfono Móvil (Opcional)</label>
                <input 
                  type="tel"
                  placeholder="+1234567890"
                  {...register('phone')} 
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[#E34234] focus:border-transparent'}`}
                />
                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button 
                type="submit" 
                disabled={(!isDirty && !selectedFile) || updateProfileMutation.isPending}
                className="bg-[#E34234] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </form>

          {/* Gestión de Direcciones Inteligente */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <AddressManager addresses={addresses} />
          </div>
        </div>

        {/* Columna Derecha: Tarjetas de Resumen o Info Adicional */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-md">
            <h3 className="font-semibold mb-2 flex items-center"><Settings className="mr-2" size={18}/> Seguridad</h3>
            <p className="text-sm text-gray-300 mb-4">Tu cuenta está protegida. Puedes cambiar tu contraseña en cualquier momento.</p>
            <button className="text-sm font-medium text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition-colors w-full">
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
