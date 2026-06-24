import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../entities/session/model/store';
import { apiClient } from '../../../shared/api/axiosClient';
import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  lastName: z.string().min(2, 'El apellido es muy corto'),
  address: z.string().min(5, 'Dirección requerida').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileEditor = () => {
  const { user, login, token } = useAuthStore();
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      lastName: user?.lastName || '',
      address: '', 
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ values, file }: { values: ProfileFormValues, file: File | null }) => {
      // 1. Actualizar datos (PUT /users/:id)
      const payload = {
        name: values.name,
        lastName: values.lastName,
        // address no existe directamente en UpdateUserDto como string, pero si lo requiere la API, se puede enviar.
      };
      
      const { data } = await apiClient.put(`/users/${user?.id}`, payload);
      
      // 2. Si hay foto, subir avatar (POST /users/:id/avatar)
      if (file) {
        const formData = new FormData();
        formData.append('image', file); // El backend espera 'image'
        await apiClient.post(`/users/${user?.id}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      // Retornar data o hacer un refetch (el backend actualiza la DB)
      return data;
    },
    onSuccess: async () => {
      // Lo ideal sería obtener el perfil nuevamente
      try {
        const { data: updatedProfile } = await apiClient.get(`/users/${user?.id}`);
        if (user && token && updatedProfile) {
           login({ ...user, ...updatedProfile }, token);
        }
      } catch (e) {
         // Fallback
         if (user && token) login({ ...user }, token);
      }
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
    updateMutation.mutate({ values, file: selectedFile });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <Avatar.Root className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-[#E34234]">
          <Avatar.Image src={previewImage || undefined} className="w-full h-full object-cover" />
          <Avatar.Fallback className="flex items-center justify-center w-full h-full text-xl text-gray-500 font-semibold">
            {user?.name?.[0]}{user?.lastName?.[0]}
          </Avatar.Fallback>
        </Avatar.Root>
        <label className="cursor-pointer text-sm font-medium text-[#E34234] hover:text-red-700 transition-colors">
          Cambiar Foto
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      <div className="space-y-4">
        <Input label="Nombre" error={errors.name?.message} {...register('name')} />
        <Input label="Apellido" error={errors.lastName?.message} {...register('lastName')} />
        <Input label="Dirección" placeholder="Empieza a escribir..." error={errors.address?.message} {...register('address')} />
      </div>

      <Button type="submit" loading={updateMutation.isPending} className="w-full bg-[#E34234] text-white">
        Guardar Cambios
      </Button>
    </form>
  );
};
