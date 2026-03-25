import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './layouts/LayoutPrincipal';
import Proyectos from './paginas/Proyectos';
import Materiales from './paginas/Materiales';
import AgentesIA from './paginas/AgentesIA';
import Dashboard from './paginas/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/proyectos" replace />} />
        
        <Route element={<LayoutPrincipal />}>
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/materiales" element={<Materiales />} />
          <Route path="/ai-agentes" element={<AgentesIA />} />
          <Route path="/dashboard" element={<Navigate to="/proyectos" replace />} />
          <Route path="/dashboard/:proyecto_id" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
