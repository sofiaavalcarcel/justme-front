import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/axiosClient';
import { useAuthStore } from '../../../entities/session/model/store';
import { MapPin, Loader2, Plus, Trash2 } from 'lucide-react';

export interface Address {
  id: string;
  alias: string; // e.g., "Home", "Office"
  street: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// Nota: Para Producción, reemplazar con @react-google-maps/api o mapbox-gl
// Esta es una estructura lista para conectar.

export const AddressManager = ({ addresses = [] }: { addresses?: Address[] }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const addAddressMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id'>) => {
      const { data } = await apiClient.post(`/users/${user?.id}/addresses`, newAddress);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setIsAdding(false);
      setSearchQuery('');
    }
  });

  const removeAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.delete(`/users/${user?.id}/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    }
  });

  const handlePlaceSelect = async () => {
    // Simulación de respuesta de Google Maps Places API
    // Reemplazar con: const place = autocomplete.getPlace();
    const simulatedPlaceFromGoogle = {
      alias: 'Nueva Dirección',
      street: searchQuery || '123 Fake Street',
      latitude: 40.7128,
      longitude: -74.0060,
      isDefault: addresses.length === 0,
    };

    addAddressMutation.mutate(simulatedPlaceFromGoogle);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Mis Direcciones</h3>
      
      <div className="space-y-3">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex items-start space-x-3">
              <MapPin className="text-[#E34234] mt-1" size={20} />
              <div>
                <p className="font-medium text-gray-900">{address.alias} {address.isDefault && <span className="text-xs bg-[#E34234] text-white px-2 py-0.5 rounded-full ml-2">Principal</span>}</p>
                <p className="text-sm text-gray-500">{address.street}</p>
              </div>
            </div>
            <button 
              onClick={() => removeAddressMutation.mutate(address.id)}
              disabled={removeAddressMutation.isPending}
              className="text-red-500 hover:text-red-700 p-2"
              title="Eliminar dirección"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {!isAdding ? (
        <button 
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-[#E34234] font-medium hover:text-red-700 transition-colors"
        >
          <Plus size={18} />
          <span>Agregar nueva dirección</span>
        </button>
      ) : (
        <div className="p-4 border rounded-lg border-gray-200 bg-white space-y-3">
          <label className="block text-sm font-medium text-gray-700">Buscar dirección</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Ingresa tu calle o edificio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#E34234] focus:ring-[#E34234] sm:text-sm px-3 py-2 border"
            />
            <button 
              type="button"
              onClick={handlePlaceSelect}
              disabled={addAddressMutation.isPending || !searchQuery}
              className="bg-[#E34234] text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {addAddressMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Impulsado por Google Maps Autocomplete (A implementar API Key)</p>
          <button type="button" onClick={() => setIsAdding(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
        </div>
      )}
    </div>
  );
};
