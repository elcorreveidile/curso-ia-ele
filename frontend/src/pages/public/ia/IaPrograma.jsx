import React from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';

const MODULES = [
  {
    roman: 'I',
    cls: 'I',
    title: 'Introducción general a la inteligencia artificial',
    items: [
      'Qué es la IA, cómo funciona y qué limitaciones tiene.',
      'El ecosistema de herramientas: ChatGPT, Claude, Gemini y más.',
      'Casos de uso reales para profesionales y pequeñas empresas.',
    ],
    task: {
      label: '📝 Actividad · Mi mapa personal de herramientas de IA',
      text: 'Selección y valoración de 5 herramientas relevantes para tu trabajo + reflexión sobre su aplicabilidad.',
    },
  },
  {
    roman: 'II',
    cls: 'II',
    title: 'Diseño de aplicaciones con IA',
    items: [
      'Prompting avanzado: del prompt básico al system prompt completo.',
      'Construcción de asistentes personalizados sin código.',
      'Herramientas no-code para crear aplicaciones con IA (GPTs, Claude Projects).',
    ],
    task: {
      label: '📝 Actividad · Diseña y prueba tu primer asistente de IA',
      text: 'System prompt completo + 5 interacciones reales documentadas + valoración crítica.',
    },
  },
  {
    roman: 'III',
    cls: 'III',
    title: 'Automatización de tareas aplicada a la pequeña empresa',
    items: [
      'Matriz de automatización: qué merece la pena delegar a la IA.',
      'Herramientas de automatización: Zapier, Make y n8n.',
      'Flujos prácticos: emails, informes, atención al cliente y redes sociales.',
    ],
    task: {
      label: '📝 Actividad · Automatiza un proceso real de tu negocio',
      text: 'Diseño del flujo + implementación + documentación del tiempo ahorrado.',
    },
  },
];

export default function IaPrograma() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Contenidos"
          title="Programa por módulos"
          desc="Tres módulos progresivos: de entender la IA a construir con ella y automatizar tu trabajo."
        />
        <div className="inner-content">
          <div className="modules-grid">
            {MODULES.map((m) => (
              <div key={m.roman} className="module-card" data-testid={`ia-programa-mod-${m.roman}`}>
                <div className={`module-card__header module-card__header--${m.cls}`}>
                  <span className="module-card__roman">{m.roman}</span>
                  <h3 className="module-card__htitle">{m.title}</h3>
                </div>
                <div className="module-card__body">
                  <div className="module-card__items">
                    {m.items.map((it, i) => (
                      <div key={i} className="module-card__item">{it}</div>
                    ))}
                  </div>
                  <div className="module-card__task">
                    <p className="module-card__task-label">{m.task.label}</p>
                    <p className="module-card__task-text">{m.task.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
