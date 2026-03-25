import React, { useEffect, useState } from 'react';
import { useMaterialesStore } from '../store/useMaterialesStore';
import Modal from '../componentes/Modal';
import { Hammer, Edit2, Trash2, Search } from 'lucide-react';

export default function Materiales() {
  const { materiales, fetchMateriales, crearMaterial, actualizarMaterial, eliminarMaterial, loading } = useMaterialesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, nombre: '', unidad: 'm²', precio_unitario: '' });
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetchMateriales();
  }, [fetchMateriales]);

  // Fallback temporal si la api no existe
  const materialesMostrar = materiales.length > 0 ? materiales : [
    { id: '1', nombre: 'Cemento Portland', unidad: 'saco', precio_unitario: 12.50 },
    { id: '2', nombre: 'Varilla Corrugada 1/2"', unidad: 'varilla', precio_unitario: 8.30 },
    { id: '3', nombre: 'Arena Fina', unidad: 'm³', precio_unitario: 25.00 },
  ];

  const filtrados = materialesMostrar.filter(m => m.nombre.toLowerCase().includes(filtro.toLowerCase()));

  const abrirModal = (material = null) => {
    if (material) {
      setFormData(material);
      setModoEdicion(true);
    } else {
      setFormData({ id: null, nombre: '', unidad: 'm²', precio_unitario: '' });
      setModoEdicion(false);
    }
    setModalOpen(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await actualizarMaterial(formData.id, {
          nombre: formData.nombre,
          unidad: formData.unidad,
          precio_unitario: Number(formData.precio_unitario)
        });
      } else {
        await crearMaterial({
          nombre: formData.nombre,
          unidad: formData.unidad,
          precio_unitario: Number(formData.precio_unitario)
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setModalOpen(false); // fallback simulacion
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este material?')) {
      try {
        await eliminarMaterial(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catálogo de Materiales</h1>
          <p className="text-gray-500 mt-1">Administra los precios unitarios base</p>
        </div>
        <button 
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Hammer size={18} />
          Nuevo Material
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar material..."
            className="w-full bg-transparent outline-none text-gray-700"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-medium text-sm">
                <th className="py-3 px-6 border-b border-gray-100 tracking-wide">Nombre</th>
                <th className="py-3 px-6 border-b border-gray-100 tracking-wide text-center">Unidad</th>
                <th className="py-3 px-6 border-b border-gray-100 tracking-wide gap-x-2 text-right">Precio Unitario</th>
                <th className="py-3 px-6 border-b border-gray-100 tracking-wide text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map((mat) => (
                <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6 font-medium text-gray-800">{mat.nombre}</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm">{mat.unidad}</span>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-blue-700">
                    ${Number(mat.precio_unitario).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => abrirModal(mat)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleEliminar(mat.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No se encontraron materiales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} titulo={modoEdicion ? "Editar Material" : "Nuevo Material"}>
        <form onSubmit={handleGuardar} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ej: m², gl, u"
                value={formData.unidad}
                onChange={e => setFormData({ ...formData, unidad: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                value={formData.precio_unitario}
                onChange={e => setFormData({ ...formData, precio_unitario: e.target.value })}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Material'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
