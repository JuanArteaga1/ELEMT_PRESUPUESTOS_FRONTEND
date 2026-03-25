import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProyectosStore } from '../store/useProyectosStore';
import Modal from '../componentes/Modal';
import { FolderKanban, ArrowRight, Home, TrendingUp } from 'lucide-react';

export default function Proyectos() {
  const navigate = useNavigate();
  const { proyectos, fetchProyectos, crearProyecto, setProyectoActivo, loading, error } = useProyectosStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    area_lote: '', 
    tipo_construccion: 'Residencial' 
  });

  useEffect(() => {
    fetchProyectos();
    // Simulación de carga vacía si la API no existe aún
    // Esto previene que explote el UI mostrando un error feo TODO: remove in prod si la api real conecta
  }, [fetchProyectos]);

  // Fallback visual temporal si no hay backend conectado aún.
  const proyectosMostrar = proyectos.length > 0 ? proyectos : [
    { id: '1', nombre: 'Edificio Los Pinos', area_lote: 450, tipo_construccion: 'Comercial' },
    { id: '2', nombre: 'Casa de Playa', area_lote: 120, tipo_construccion: 'Residencial' }
  ];

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await crearProyecto({ ...formData, area_lote: Number(formData.area_lote) });
      setModalOpen(false);
      setFormData({ nombre: '', area_lote: '', tipo_construccion: 'Residencial' });
    } catch (err) {
      console.error('Error al crear proyecto (usar simulación)', err);
      // Para simular el UX en caso de que la api de error:
      setModalOpen(false);
    }
  };

  const seleccionarYNavgar = (proyecto) => {
    setProyectoActivo(proyecto);
    navigate(`/dashboard/${proyecto.id}`);
  };

  if (loading) return <div className="text-gray-500 text-center mt-10">Cargando proyectos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Proyectos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus presupuestos de construcción</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <FolderKanban size={18} />
          Crear Proyecto
        </button>
      </div>
      
      {error && (
        <div className="bg-orange-50 text-orange-600 p-4 rounded-xl border border-orange-100 flex items-center gap-2">
          ⚠ No se pudo conectar a la base de datos de manera real, mostrando datos de prueba.
        </div>
      )}

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {proyectosMostrar.map((proj) => (
          <div 
            key={proj.id} 
            onClick={() => seleccionarYNavgar(proj)}
            className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {proj.tipo_construccion === 'Comercial' ? <TrendingUp size={20} /> : <Home size={20} />}
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 mb-1">{proj.nombre}</h3>
            <div className="text-sm text-gray-500 flex-1 mb-6 flex flex-col gap-1">
              <span>Área: <span className="font-medium text-gray-700">{proj.area_lote} m²</span></span>
              <span>Tipo: <span className="font-medium text-gray-700">{proj.tipo_construccion}</span></span>
            </div>
            
            <div className="flex items-center text-blue-600 font-medium text-sm mt-auto group-hover:gap-2 transition-all gap-1">
              Ver Dashboard
              <ArrowRight size={16} />
            </div>
          </div>
        ))}

        <div 
          onClick={() => setModalOpen(true)}
          className="bg-transparent border-2 border-dashed border-gray-300 rounded-2xl p-5 text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[200px]"
        >
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <FolderKanban size={24} />
          </div>
          <span className="font-medium">Nuevo Proyecto</span>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} titulo="Crear Nuevo Proyecto">
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              placeholder="Ej: Residencial Los Alpes"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área del Lote (m²)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
              placeholder="Ej: 250"
              value={formData.area_lote}
              onChange={e => setFormData({ ...formData, area_lote: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Construcción</label>
            <select 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-white transition-all"
              value={formData.tipo_construccion}
              onChange={e => setFormData({ ...formData, tipo_construccion: e.target.value })}
            >
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Guardar Proyecto'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
