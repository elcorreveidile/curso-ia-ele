import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './lib/auth';
import { CourseProvider } from './lib/course';
import Protected from './components/Protected';
import FounderBanner from './components/FounderBanner';

// Hub
import Home from './pages/public/Home';

// ELE course public pages
import EleHome from './pages/public/ele/EleHome';
import Descripcion from './pages/public/Descripcion';
import Programa from './pages/public/Programa';
import Calendario from './pages/public/Calendario';
import Metodologia from './pages/public/Metodologia';
import Precios from './pages/public/Precios';
import SobreMi from './pages/public/SobreMi';

// IA course public pages
import IaHome from './pages/public/ia/IaHome';
import IaDescripcion from './pages/public/ia/IaDescripcion';
import IaPrograma from './pages/public/ia/IaPrograma';
import IaPrecios from './pages/public/ia/IaPrecios';

// Shared public pages
import Login from './pages/public/Login';
import Verify from './pages/public/Verify';
import Inscripcion from './pages/public/Inscripcion';
import CheckEmail from './pages/public/CheckEmail';
import Success from './pages/public/Success';
import Certificate from './pages/public/Certificate';
import Contacto from './pages/public/Contacto';
import Cuestionario from './pages/public/Cuestionario';

// Private pages
import Dashboard from './pages/private/Dashboard';
import CursoDetail from './pages/private/CursoDetail';
import ModuleDetail from './pages/private/ModuleDetail';
import TaskDetail from './pages/private/TaskDetail';
import Forum from './pages/private/Forum';
import Resource from './pages/private/Resource';
import CourseResources from './pages/private/CourseResources';
import Profile from './pages/private/Profile';
import Ebook from './pages/private/Ebook';
import EbookChapter from './pages/private/EbookChapter';

import Admin from './pages/admin/Admin';

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <BrowserRouter>
          <FounderBanner />
          <Routes>
            {/* Hub */}
            <Route path="/" element={<Home />} />

            {/* ELE course — new canonical URLs */}
            <Route path="/curso-ele" element={<EleHome />} />
            <Route path="/curso-ele/descripcion" element={<Descripcion />} />
            <Route path="/curso-ele/programa" element={<Programa />} />
            <Route path="/curso-ele/calendario" element={<Calendario />} />
            <Route path="/curso-ele/metodologia" element={<Metodologia />} />
            <Route path="/curso-ele/precios" element={<Precios />} />
            <Route path="/curso-ele/sobre-mi" element={<SobreMi />} />

            {/* ELE course — legacy flat URLs redirect to new canonical */}
            <Route path="/descripcion" element={<Navigate to="/curso-ele/descripcion" replace />} />
            <Route path="/programa" element={<Navigate to="/curso-ele/programa" replace />} />
            <Route path="/calendario" element={<Navigate to="/curso-ele/calendario" replace />} />
            <Route path="/metodologia" element={<Navigate to="/curso-ele/metodologia" replace />} />
            <Route path="/precios" element={<Navigate to="/curso-ele/precios" replace />} />
            <Route path="/sobre-mi" element={<Navigate to="/curso-ele/sobre-mi" replace />} />

            {/* IA course */}
            <Route path="/curso-ia" element={<IaHome />} />
            <Route path="/curso-ia/descripcion" element={<IaDescripcion />} />
            <Route path="/curso-ia/programa" element={<IaPrograma />} />
            <Route path="/curso-ia/precios" element={<IaPrecios />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/verify" element={<Verify />} />

            {/* Enrollment / payment (generic, works for both courses) */}
            <Route path="/inscripcion/:slug" element={<Inscripcion />} />
            <Route path="/inscripcion/check-email" element={<CheckEmail />} />
            <Route path="/inscripcion/success" element={<Success />} />

            {/* Other public */}
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
