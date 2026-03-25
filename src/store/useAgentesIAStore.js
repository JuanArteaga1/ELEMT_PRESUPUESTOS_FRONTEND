import { create } from 'zustand';
import api from '../servicios/api';

export const useAgentesIAStore = create((set) => ({
  agentes: [],
  loading: false,
  error: null,

  fetchAgentes: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/ai-agentes');
      set({ agentes: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  toggleActivo: async (id, activo) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/ai-agentes/${id}`, { activo });
      set((state) => ({
        agentes: state.agentes.map(a => a.id === id ? data : a),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
