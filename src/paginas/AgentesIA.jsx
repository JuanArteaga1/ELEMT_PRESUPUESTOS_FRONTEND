import React, { useEffect, useState } from 'react';
import { useAgentesIAStore } from '../store/useAgentesIAStore';
import Modal from '../componentes/Modal';
import { Bot, Check, X } from 'lucide-react';

export default function AgentesIA() {
  const { agentes, fetchAgentes, toggleActivo, loading } = useAgentesIAStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAgentes();
  }, [fetchAgentes]);

  // Fallback temporal
  const agentesMostrar = agentes.length > 0 ? agentes : [
    { id: '1', nombre: 'Agente Estructurista', descripcion: 'Especialista en concreto y acero', activo: true },
    { id: '2', nombre: 'Agente Acabados', descripcion: 'Especializado en pintura y cerámicas', activo: false },
  ];

  const handleToggle = async (id, estadoActual) => {
    try {
      await toggleActivo(id, !estadoActual);
    } catch (error) {
      console.error(error);
      // Simulación optimista en caso error backend falso
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agentes IA</h1>
          <p className="text-gray-500 mt-1">Configura los asistentes expertos para presupuestar</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Bot size={18} />
          Nuevo Agente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agentesMostrar.map(agente => (
          <div 
            key={agente.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
              agente.activo ? 'border-blue-400 ring-2 ring-blue-50 scale-[1.02]' : 'border-gray-100 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${agente.activo ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Bot size={24} />
              </div>
              
              {/* Switch Custom */}
              <button 
                onClick={() => handleToggle(agente.id, agente.activo)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex ${
                  agente.activo ? 'bg-blue-500 justify-end' : 'bg-gray-200 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md flex items-center justify-center">
                  {agente.activo ? <Check size={10} className="text-blue-500" /> : <X size={10} className="text-gray-400" />}
                </div>
              </button>
            </div>

            <h3 className={`font-bold text-lg mb-1 ${agente.activo ? 'text-gray-900' : 'text-gray-500'}`}>
              {agente.nombre}
            </h3>
            <p className="text-gray-500 text-sm h-10 line-clamp-2">
              {agente.descripcion}
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm font-medium flex items-center justify-between">
              <span className={agente.activo ? 'text-blue-600' : 'text-gray-400'}>
                {agente.activo ? 'En línea' : 'Inactivo'}
              </span>
              {agente.activo && (
                <span className="flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal simulado */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} titulo="Registrar Nuevo Agente IA">
        <p className="text-gray-500 mb-6">Funcionalidad en construcción (Requiere integración directa con Azure/OpenAI).</p>
        <button 
          onClick={() => setModalOpen(false)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
}
