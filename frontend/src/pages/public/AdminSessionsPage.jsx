import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import AdminSessions from '../../components/admin/AdminSessions';

export default function AdminSessionsPage() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Administración"
          title="Gestión de Sesiones"
          desc="Administra sesiones individuales y grupales del sistema de reservas."
        />
        <div className="inner-content">
          <AdminSessions />
        </div>
      </div>
      <Footer />
    </>
  );
}
