import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Hammer, Bot, Menu, Bell } from 'lucide-react';
import { useProyectosStore } from '../store/useProyectosStore';

const MenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyectos', path: '/proyectos', icon: FolderKanban },
  { name: 'Materiales', path: '/materiales', icon: Hammer },
  { name: 'Agentes IA', path: '/ai-agentes', icon: Bot },
];

export default function LayoutPrincipal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const proyectoActivo = useProyectosStore((state) => state.proyectoActivo);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className={`font-bold text-blue-600 truncate transition-all ${sidebarOpen ? 'text-xl' : 'text-sm'}`}>
            {sidebarOpen ? 'Presupuestos IA' : 'IA'}
          </h1>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-2 px-3 hover:overflow-y-auto">
          {MenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm font-medium text-gray-500">
              {proyectoActivo ? `Proyecto: ${proyectoActivo.nombre}` : 'Selecciona un proyecto'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-600 font-medium">Sistema Online</span>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
              <Bell size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
