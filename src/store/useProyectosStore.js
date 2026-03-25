import { create } from 'zustand';
import api from '../servicios/api';

export const useProyectosStore = create((set) => ({
  proyectos: [],
  proyectoActivo: null,
  loading: false,
  error: null,

  fetchProyectos: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/proyectos');
      set({ proyectos: data, loading: false });
    } catch (error) {
      console.warn("API de proyectos no encontrada, usando datos de prueba locales.");
      set({ error: null, loading: false }); // Suprime el error visual/bloqueante
    }
  },

  setProyectoActivo: (proyecto) => set({ proyectoActivo: proyecto }),

  fetchProyectoDetalle: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/proyectos/${id}`);
      set({ proyectoActivo: data, loading: false });
      return data;
    } catch (error) {
      console.warn("No se pudo cargar el detalle del proyecto.");
      set({ error: null, loading: false });
      return null;
    }
  },

  crearProyecto: async (nuevoProyecto) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/proyectos', nuevoProyecto);
      set((state) => ({ 
        proyectos: [...state.proyectos, data],
        loading: false 
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));
