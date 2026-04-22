import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './lib/auth';
import { CourseProvider } from './lib/course';
import Protected from './components/Protected';
import FounderBanner from './components/FounderBanner';

import Home from './pages/public/Home';
import Descripcion from './pages/public/Descripcion';
import Programa from './pages/public/Programa';
import Calendario from './pages/public/Calendario';
import Metodologia from './pages/public/Metodologia';
import Precios from './pages/public/Precios';
import SobreMi from './pages/public/SobreMi';
import Login from './pages/public/Login';
import Verify from './pages/public/Verify';
import Inscripcion from './pages/public/Inscripcion';
import CheckEmail from './pages/public/CheckEmail';
import Success from './pages/public/Success';

import Dashboard from './pages/private/Dashboard';
import CursoDetail from './pages/private/CursoDetail';
import ModuleDetail from './pages/private/ModuleDetail';
import TaskDetail from './pages/private/TaskDetail';
import Forum from './pages/private/Forum';

import Admin from './pages/admin/Admin';
import Certificate from './pages/public/Certificate';
import Contacto from './pages/public/Contacto';
import Cuestionario from './pages/public/Cuestionario';
import Resource from './pages/private/Resource';
import CourseResources from './pages/private/CourseResources';
import Profile from './pages/private/Profile';
import Ebook from './pages/private/Ebook';
import EbookChapter from './pages/private/EbookChapter';

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <BrowserRouter>
          <FounderBanner />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/descripcion" element={<Descripcion />} />
            <Route path="/programa" element={<Programa />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="/precios" element={<Precios />} />
            <Route path="/sobre-mi" element={<SobreMi />} />

            <Route path="/login" element={<Login />} />
            <Route path="/auth/verify" element={<Verify />} />

            <Route path="/inscripcion/:slug" element={<Inscripcion />} />
            <Route path="/inscripcion/check-email" element={<CheckEmail />} />
            <Route path="/inscripcion/success" element={<Success />} />

            <Route path="/certificado/:certId" element={<Certificate />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/cuestionario" element={<Cuestionario />} />

            {/* Private */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/mi-area/perfil" element={<Protected><Profile /></Protected>} />
            <Route path="/libro" element={<Protected><Ebook /></Protected>} />
            <Route path="/libro/:slug" element={<Protected><EbookChapter /></Protected>} />
            <Route path="/curso/:slug" element={<Protected><CursoDetail /></Protected>} />
            <Route path="/curso/:slug/modulo/:moduleId" element={<Protected><ModuleDetail /></Protected>} />
            <Route path="/curso/:slug/tarea/:taskId" element={<Protected><TaskDetail /></Protected>} />
            <Route path="/curso/:slug/tarea/:taskId/foro" element={<Protected><Forum /></Protected>} />
            <Route path="/curso/:slug/recursos" element={<Protected><CourseResources /></Protected>} />
            <Route path="/recurso/:slug" element={<Protected><Resource /></Protected>} />

            <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CourseProvider>
    </AuthProvider>
  );
}
