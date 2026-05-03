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

// Curso gratuito estudiantes
import AprendeHome        from './pages/public/aprende/AprendeHome';
import AprendePrograma    from './pages/public/aprende/AprendePrograma';
import AprendeModulo      from './pages/public/aprende/AprendeModulo';
import AprendeCursoHome   from './pages/public/aprende/AprendeCursoHome';

// Sesiones
import Sesiones            from './pages/public/sesiones/Sesiones';
import ReservaIndividual   from './pages/public/sesiones/ReservaIndividual';
import ReservaGrupal       from './pages/public/sesiones/ReservaGrupal';
import SesionConfirmada    from './pages/public/sesiones/SesionConfirmada';
import SesionCancelada     from './pages/public/sesiones/SesionCancelada';
import AdminSessionsPage   from './pages/public/AdminSessionsPage';

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

            {/* Curso gratuito estudiantes */}
            <Route path="/aprende" element={<AprendeHome />} />
            <Route path="/aprende/curso" element={<AprendeCursoHome />} />
            <Route path="/aprende/curso/programa" element={<AprendePrograma />} />
            <Route path="/aprende/curso/modulo/:id" element={<AprendeModulo />} />

            {/* Sesiones */}
            <Route path="/sesiones" element={<Sesiones />} />
            <Route path="/sesiones/individual" element={<ReservaIndividual />} />
            <Route path="/sesiones/grupal/:id" element={<ReservaGrupal />} />
            <Route path="/sesiones/confirmada" element={<SesionConfirmada />} />
            <Route path="/sesiones/cancelada" element={<SesionCancelada />} />

            {/* Admin Sesiones (temporal - sin autenticación) */}
            <Route path="/admin-sesiones" element={<AdminSessionsPage />} />

            {/* Private */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/curso/:slug" element={<Protected><CursoDetail /></Protected>} />
            <Route path="/curso/:slug/modulo/:moduleId" element={<Protected><ModuleDetail /></Protected>} />
            <Route path="/curso/:slug/tarea/:taskId" element={<Protected><TaskDetail /></Protected>} />
            <Route path="/curso/:slug/tarea/:taskId/foro" element={<Protected><Forum /></Protected>} />

            <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CourseProvider>
    </AuthProvider>
  );
}
