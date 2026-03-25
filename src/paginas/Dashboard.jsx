import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIAStore } from '../store/useIAStore';
import { useProyectosStore } from '../store/useProyectosStore';
import api from '../servicios/api';
import { Send, Bot, User, Calculator, ArrowLeft, RefreshCcw, Package } from 'lucide-react';

export default function Dashboard() {
  const { proyecto_id } = useParams();
  const navigate = useNavigate();
  const proyectoActivo = useProyectosStore(state => state.proyectoActivo);
  const fetchProyectoDetalle = useProyectosStore(state => state.fetchProyectoDetalle);
  
  const { obtenerMensajes, obtenerMaterialesFaltantes, limpiarMaterialesFaltantes, enviarMensaje, ultimoMensajePorProyecto, loading } = useIAStore();
  
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [faltantesForm, setFaltantesForm] = useState({});
  const [guardandoFaltantes, setGuardandoFaltantes] = useState(false);
  
  const mensajes = obtenerMensajes(proyecto_id);
  const faltantes = obtenerMaterialesFaltantes(proyecto_id);
  const ultimoMensaje = ultimoMensajePorProyecto[proyecto_id];
  const chatEndRef = useRef(null);

  // Items del backend (fuente de verdad persistente)
  const itemsBackend = proyectoActivo?.items || [];
  const presupuestoTotal = itemsBackend.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

  // Cargar proyecto completo del backend al montar
  const recargarProyecto = useCallback(async () => {
    await fetchProyectoDetalle(proyecto_id);
  }, [proyecto_id, fetchProyectoDetalle]);

  useEffect(() => {
    recargarProyecto();
  }, [recargarProyecto]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading, isTyping]);

  useEffect(() => {
    if (loading) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || faltantes.length > 0) return;
    
    const txt = inputVal;
    setInputVal('');
    await enviarMensaje(proyecto_id, txt);
    // Recargar proyecto del backend para obtener items persistidos
    await recargarProyecto();
  };

  const handleGuardarFaltantes = async (e) => {
    e.preventDefault();
    setGuardandoFaltantes(true);
    try {
      const promesas = faltantes.map((mat) => {
        const datos = faltantesForm[mat] || {};
        return api.post('/materiales', {
          nombre: mat,
          unidad: datos.unidad || 'u',
          precio_unitario: Number(datos.precio || 0)
        });
      });
      await Promise.all(promesas);
      
      limpiarMaterialesFaltantes(proyecto_id);
      setFaltantesForm({});
      
      // Auto-reintento
      if (ultimoMensaje) {
        await enviarMensaje(proyecto_id, ultimoMensaje);
        await recargarProyecto();
      }
    } catch (err) {
      console.error(err);
      alert('Error en conexión al guardar materiales.');
    } finally {
      setGuardandoFaltantes(false);
    }
  };

  if (!proyectoActivo && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 pt-20">
        <h2 className="text-xl font-medium text-gray-500">Por favor, selecciona un proyecto primero.</h2>
        <button onClick={() => navigate('/proyectos')} className="text-blue-600 flex items-center gap-2 hover:underline">
          <ArrowLeft size={16} /> Volver a Proyectos
        </button>
      </div>
    );
  }



  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
      {/* Columna Izquierda: Chat IA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-100 min-h-[500px]">
        {/* Header Chat */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 tracking-tight">Asistente IA Arquitecto</h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide flex items-center gap-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => useIAStore.getState().limpiarHistorial(proyecto_id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            title="Borrar historial"
          >
            <RefreshCcw size={16} />
            <span className="text-sm hidden sm:inline">Reiniciar</span>
          </button>
        </div>

        {/* Zona de Mensajes */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#fafafa] flex flex-col gap-6">
          {mensajes.length === 0 && (
            <div className="m-auto text-center space-y-4 max-w-sm">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bot size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">¡Hola! Soy tu Agente IA</h3>
              <p className="text-gray-500 text-sm">
                Dime qué quieres construir o describe los planos del proyecto <b>{proyecto?.nombre}</b> y generaré un presupuesto detallado al instante.
              </p>
            </div>
          )}

          {mensajes.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.rol === 'usuario' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                  msg.rol === 'usuario' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
                }`}>
                  {msg.rol === 'usuario' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Burbuja */}
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative whitespace-pre-wrap ${
                  msg.rol === 'usuario' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.texto}
                  
                  {/* Punterito de burbuja */}
                  <div className={`absolute top-0 w-3 h-3 ${
                    msg.rol === 'usuario'
                      ? '-right-1.5 bg-blue-600 rotate-45 transform origin-bottom-left'
                      : '-left-1.5 bg-white border-l border-t border-gray-100 rotate-[-45deg] transform origin-bottom-right'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}

          {loading && isTyping && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="px-5 py-4 rounded-2xl shadow-sm bg-white border border-gray-100 rounded-tl-sm flex items-center gap-1.5">
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />

          {faltantes.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-4">
                <Calculator size={18} />
                Completá los Precios Faltantes
              </h4>
              <form onSubmit={handleGuardarFaltantes} className="flex flex-col gap-4">
                {faltantes.map((mat) => (
                  <div key={mat} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 border-b border-orange-200/50 pb-4 last:border-0 last:pb-0">
                    <span className="font-bold text-orange-900 lg:w-1/3 capitalize line-clamp-2">{mat}</span>
                    <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                        <input 
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Precio"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all shadow-inner text-sm"
                          value={faltantesForm[mat]?.precio || ''}
                          onChange={(e) => setFaltantesForm({
                            ...faltantesForm, 
                            [mat]: { ...faltantesForm[mat], precio: e.target.value }
                          })}
                          disabled={guardandoFaltantes}
                          autoFocus
                        />
                      </div>
                      <div className="relative flex-1">
                        <input 
                          required
                          type="text"
                          placeholder="Unidad (Ej: m², gl, u)"
                          className="w-full px-4 py-2.5 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all shadow-inner text-sm"
                          value={faltantesForm[mat]?.unidad || ''}
                          onChange={(e) => setFaltantesForm({
                            ...faltantesForm, 
                            [mat]: { ...faltantesForm[mat], unidad: e.target.value }
                          })}
                          disabled={guardandoFaltantes}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="submit" 
                  disabled={guardandoFaltantes}
                  className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {guardandoFaltantes ? 'Guardando y Reintentando...' : 'Guardar y Continuar Presupuesto'}
                  {!guardandoFaltantes && <Send size={16} />}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ej: Necesito presupuestar la cimentación de 100m²..." 
              className="w-full pl-5 pr-14 py-3.5 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-[15px] shadow-inner placeholder:text-gray-400 disabled:opacity-50"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={loading || faltantes.length > 0}
              autoFocus
            />
            <button 
              type="submit"
              disabled={!inputVal.trim() || loading || faltantes.length > 0}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md"
            >
              <Send size={18} className={loading && !isTyping ? "animate-pulse" : ""} />
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-gray-400 font-medium">
            La IA puede cometer errores. Verifica los cálculos.
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resumen del Presupuesto */}
      <div className="w-full md:w-1/3 md:min-w-[340px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Presupuesto Actual</h2>
          <Calculator className="text-gray-400" size={20} />
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <span className="text-sm text-blue-100 font-medium uppercase tracking-wider mb-2 block 0">Costo Total Estimado</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">
              ${presupuestoTotal.toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold text-gray-800">Desglose de Ítems</h3>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">{itemsBackend.length} ítems</span>
          </div>
          {itemsBackend.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-100 rounded-xl p-6">
              <Calculator size={32} className="text-gray-200" />
              <p className="text-sm text-center font-medium">Habla con la IA para generar ítems automáticamente.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {itemsBackend.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{item.nombre}</span>
                      <span className="text-xs text-gray-500 font-semibold mt-0.5">
                        {item.cantidad} {item.unidad || 'u'} · <span className="capitalize">{item.categoria}</span>
                      </span>
                    </div>
                    <span className="font-extrabold text-blue-700 text-lg">${Number(item.total).toLocaleString('es-ES')}</span>
                  </div>
                  
                  {item.materiales && item.materiales.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Package size={12} /> Materiales usados
                      </span>
                      {item.materiales.map((m) => (
                        <div key={m.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{m.material?.nombre || 'Material'} <span className="text-gray-400">x{m.cantidad}</span></span>
                          <span className="font-semibold text-gray-700">${Number(m.costo_total).toLocaleString('es-ES')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="bg-blue-50/50 p-4 rounded-xl flex justify-between items-center border border-blue-100 border-dashed animate-pulse">
                  <span className="text-sm font-medium text-blue-600">Calculando...</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-medium transition-all shadow-md">
          Exportar a Excel
        </button>
      </div>
    </div>
  );
}
