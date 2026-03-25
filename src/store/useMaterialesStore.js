import { create } from 'zustand';
import api from '../servicios/api';

export const useMaterialesStore = create((set) => ({
  materiales: [],
  loading: false,
  error: null,

  fetchMateriales: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/materiales');
      set({ materiales: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  crearMaterial: async (material) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/materiales', material);
      set((state) => ({ materiales: [...state.materiales, data], loading: false }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  actualizarMaterial: async (id, cambios) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/materiales/${id}`, cambios);
      set((state) => ({
        materiales: state.materiales.map(m => m.id === id ? data : m),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  eliminarMaterial: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/materiales/${id}`);
      set((state) => ({
        materiales: state.materiales.filter(m => m.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
