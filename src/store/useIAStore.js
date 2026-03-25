import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../servicios/api';

export const useIAStore = create(
  persist(
    (set, get) => ({
      mensajesPorProyecto: {}, // { [proyectoId]: [mensajes] }
      itemsPorProyecto: {},    // { [proyectoId]: [items] }
      ultimoMensajePorProyecto: {}, // Para reintentar la acción
      materialesFaltantesPorProyecto: {}, // Array de strings con los nombres
      loading: false,
      error: null,

      obtenerMensajes: (proyectoId) => {
        return get().mensajesPorProyecto[proyectoId] || [];
      },
      
      obtenerItems: (proyectoId) => {
        return get().itemsPorProyecto[proyectoId] || [];
      },

      obtenerMaterialesFaltantes: (proyectoId) => {
        return get().materialesFaltantesPorProyecto[proyectoId] || [];
      },

      limpiarMaterialesFaltantes: (proyectoId) => {
        set((state) => ({
          materialesFaltantesPorProyecto: {
            ...state.materialesFaltantesPorProyecto,
            [proyectoId]: []
          }
        }));
      },

      enviarMensaje: async (proyectoId, textoUsuario) => {
        const nuevoMensaje = { id: Date.now(), rol: 'usuario', texto: textoUsuario };
        
        set((state) => {
          const mensajesPrevios = state.mensajesPorProyecto[proyectoId] || [];
          return {
            mensajesPorProyecto: {
              ...state.mensajesPorProyecto,
              [proyectoId]: [...mensajesPrevios, nuevoMensaje]
            },
            ultimoMensajePorProyecto: {
              ...state.ultimoMensajePorProyecto,
              [proyectoId]: textoUsuario
            },
            loading: true,
            error: null
          };
        });

        try {
          const { data } = await api.post('/ia/presupuestar', { 
            proyecto_id: proyectoId, 
            texto_usuario: textoUsuario 
          });
          
          let textoLegible = "";
          let itemsExtraidos = [];

          if (data.estado === "Exito" && data.itemsCreados) {
            itemsExtraidos = data.itemsCreados;
            const detalles = itemsExtraidos.map(i => `• ${i.cantidad} ${i.unidad || 'u'} de **${i.nombre}** ($${i.total.toLocaleString('es-ES')})`).join('\n');
            textoLegible = `¡Perfecto! Agregué ${itemsExtraidos.length} ítem(s) al presupuesto:\n\n${detalles}`;
          } else {
            // Fallback si la IA o el Backend mandan otro formato
            textoLegible = data.mensaje || data.respuesta || JSON.stringify(data, null, 2);
          }
          
          const respuestaIA = {
            id: Date.now() + 1,
            rol: 'ia',
            texto: textoLegible 
          };

          set((state) => {
            const mensajesAgregados = state.mensajesPorProyecto[proyectoId] || [];
            const presupuestoItemsActuales = state.itemsPorProyecto[proyectoId] || [];
            
            const nuevosItemsDiccionario = itemsExtraidos.length > 0 
              ? {
                  ...state.itemsPorProyecto,
                  [proyectoId]: [...presupuestoItemsActuales, ...itemsExtraidos]
                }
              : state.itemsPorProyecto;

            return {
              mensajesPorProyecto: {
                ...state.mensajesPorProyecto,
                [proyectoId]: [...mensajesAgregados, respuestaIA]
              },
              itemsPorProyecto: nuevosItemsDiccionario,
              loading: false
            };
          });
        } catch (error) {
          const status = error.response?.status;
          const apiData = error.response?.data;
          
          let textoError = "Ocurrió un error de conexión con el agente IA.";

          // Manejar el caso 409: materiales faltantes
          if (status === 409 && apiData?.detalles?.materiales_faltantes) {
            const materiales = apiData.detalles.materiales_faltantes;
            textoError = `⚠️ No encontré los precios para: **${materiales.join(', ')}**. Por favor establece sus valores aquí abajo para continuar.`;
            
            set((state) => ({
              materialesFaltantesPorProyecto: {
                ...state.materialesFaltantesPorProyecto,
                [proyectoId]: materiales
              }
            }));
          } else if (apiData?.error) {
            // Manejar otros errores documentados por el backend
            textoError = `❌ ${apiData.error}`;
          }

          const respuestaErrorIA = {
            id: Date.now() + 1,
            rol: 'ia',
            texto: textoError
          };

          set((state) => {
            const mensajesAgregados = state.mensajesPorProyecto[proyectoId] || [];
            return {
              mensajesPorProyecto: {
                ...state.mensajesPorProyecto,
                [proyectoId]: [...mensajesAgregados, respuestaErrorIA]
              },
              error: null, // Lo manejamos conversacionalmente
              loading: false
            };
          });
        }
      },

      limpiarHistorial: (proyectoId) => {
        set((state) => ({
          mensajesPorProyecto: {
            ...state.mensajesPorProyecto,
            [proyectoId]: []
          },
          itemsPorProyecto: {
            ...state.itemsPorProyecto,
            [proyectoId]: []
          }
        }));
      }
    }),
    {
      name: 'ia-chat-storage',
    }
  )
);
