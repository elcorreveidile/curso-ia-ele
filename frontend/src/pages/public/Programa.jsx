import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';

const MODULES = [
  {
    roman: 'I',
    cls: 'I',
    title: 'Ética y prompts eficaces',
    items: [
      'Reflexión crítica sobre el uso ético y responsable de la IA en educación.',
      'Principios básicos de ingeniería de prompts aplicados a la enseñanza de ELE.',
      'Elaboración de prompts eficaces para distintos géneros y contextos textuales.',
    ],
    task: {
      label: '📝 Actividad · Mi declaración de uso ético de la IA',
      text: 'Análisis de casos reales + redacción de tu declaración de principios + debate en foro.',
    },
  },
  {
    roman: 'II',
    cls: 'II',
    title: 'Tu asistente de ELE: chatbots a tu medida',
    items: [
      'Exploración de los principales chatbots y sus posibilidades para ELE.',
      'Uso de mini asistentes para crear materiales específicos de clase.',
      'Creación de asistentes educativos propios configurados para tu alumnado.',
    ],
    task: {
      label: '📝 Actividad · Crea tu primer mini asistente ELE',
      text: 'Diseño de system prompt + prueba con interacciones simuladas + valoración crítica.',
    },
  },
  {
    roman: 'III',
    cls: 'III',
    title: 'Planifica con IA: clases alineadas con el MCER',
    items: [
      'Prompts plantilla alineados con los descriptores del MCER.',
      'Diseño de secuencias didácticas integrando herramientas de IA gratuitas.',
      'Creación de mini apps para generar planes de clase automatizados.',
    ],
    task: {
      label: '📝 Actividad · Genera y evalúa un plan de clase con IA',
      text: 'Generación con prompt plantilla + revisión según criterios MCER + reflexión sobre co-creación.',
    },
  },
  {
    roman: 'IV',
    cls: 'IV',
    title: 'Crea sin límites: recursos multimodales con IA gratuita',
    items: [
      'Generación de imágenes con IA para activar conocimientos previos en clase.',
      'Creación de audios y diálogos para trabajar la comprensión oral.',
      'Diseño de mapas mentales de vocabulario y estructuras con IA gratuita.',
    ],
    task: {
      label: '📝 Actividad · Kit de recursos multimodales',
      text: 'Imagen + audio + mapa mental para una unidad real + reflexión final en foro.',
    },
  },
];

export default function Programa() {
  return (
    <>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Contenidos"
          title="Programa por módulos"
          desc="Cuatro módulos progresivos que van de la reflexión ética a la producción práctica de materiales."
        />
        <div className="inner-content">
          <div className="modules-grid">
            {MODULES.map((m) => (
              <div key={m.roman} className="module-card" data-testid={`programa-mod-${m.roman}`}>
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
