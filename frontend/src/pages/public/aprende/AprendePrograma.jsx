import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import FreeCourseProtected from '../../../components/FreeCourseProtected';

const MODULES = [
  {
    id: 'intro',
    num: '0',
    title: 'Introducción y punto de partida',
    subtitle: '¿Para qué sirve este curso?',
    duration: '70 min',
    free: true,
    submodules: [
      {
        id: '0a',
        title: '0-A · Introducción al curso',
        items: [
          '¿Usas ya la IA para aprender español?',
          'La diferencia entre usar IA para aprender y usarla para evitar el esfuerzo.',
          'El marco de las 4D: Delegación, Descripción, Discernimiento, Diligencia.',
          'Qué necesitas para este curso.',
        ],
        activity: 'Mi punto de partida: reflexión escrita + primera interacción con IA.',
        video: { duration: '3 min', type: 'locución' },
      },
      {
        id: '0b',
        title: '0-B · Tu espacio de aprendizaje en GitHub',
        items: [
          'Qué es GitHub y para qué lo usamos.',
          'Crear tu cuenta paso a paso.',
          'Crear tu repositorio del curso.',
          'Subir tu primera actividad.',
          'Cómo compartirlo si reservas una sesión.',
        ],
        activity: 'Repositorio GitHub creado + primer archivo subido.',
        video: { duration: '4 min', type: 'grabación de pantalla' },
      },
    ],
  },
  {
    id: 'delegacion',
    num: 'I',
    title: 'Delegación',
    subtitle: '¿Qué dejas en manos de la IA?',
    duration: '30 min',
    free: true,
    bloque_a: {
      title: 'Para cualquier estudiante de lenguas',
      items: [
        'Aprender una lengua vs completar tareas de lengua.',
        'Automatización vs augmentación.',
        'Cuándo pedir ayuda a la IA y cuándo no.',
        'Conciencia de plataforma: no todos los chatbots sirven igual.',
      ],
    },
    bloque_b: {
      title: 'Específico para español',
      items: [
        'El MCER como brújula: nivel y delegación.',
        'Qué puede hacer la IA según tu nivel (A1–C2).',
        'Qué nunca debe hacer la IA si quieres mejorar.',
      ],
    },
    activity: 'Autoevaluación de nivel + mapa de delegación personal.',
    video: { duration: '5 min', type: 'locución' },
  },
  {
    id: 'descripcion',
    num: 'II',
    title: 'Descripción',
    subtitle: 'Cómo hablarle a la IA para que te ayude a aprender',
    duration: '35 min',
    free: true,
    bloque_a: {
      title: 'Para cualquier estudiante de lenguas',
      items: [
        'Dar órdenes vs tener una conversación.',
        'Descripción del producto, del proceso y del comportamiento.',
        'La IA como tutor, compañero, corrector o generador de ejemplos.',
      ],
    },
    bloque_b: {
      title: 'Específico para español',
      items: [
        'El marco FRAME aplicado al aprendizaje de español.',
        'Prompts para las cuatro destrezas comunicativas.',
        'Gramática sin respuesta directa.',
        'Vocabulario en contexto real.',
      ],
    },
    activity: 'Construye tres prompts FRAME para tu nivel y tu necesidad real.',
    video: { duration: '5 min', type: 'locución con demo' },
  },
  {
    id: 'discernimiento',
    num: 'III',
    title: 'Discernimiento',
    subtitle: 'Cómo evaluar lo que te da la IA',
    duration: '30 min',
    free: true,
    bloque_a: {
      title: 'Para cualquier estudiante de lenguas',
      items: [
        'Qué tipo de errores comete la IA y cómo detectarlos.',
        '¿Entiendo esto o solo lo estoy copiando?',
        'Cómo saber si realmente has aprendido algo.',
        'Crecer vs depender.',
      ],
    },
    bloque_b: {
      title: 'Específico para español',
      items: [
        'Errores frecuentes de la IA en español.',
        'Verificar que el español es auténtico y apropiado.',
        'El PCIC como herramienta de verificación.',
        'Español auténtico vs español «de chatbot».',
      ],
    },
    activity: 'Análisis crítico de tres outputs de IA en español.',
    video: { duration: '5 min', type: 'locución' },
  },
  {
    id: 'diligencia',
    num: 'IV',
    title: 'Diligencia',
    subtitle: 'Usar la IA con responsabilidad',
    duration: '25 min',
    free: true,
    bloque_a: {
      title: 'Para cualquier estudiante de lenguas',
      items: [
        'Integridad académica y uso ético de la IA.',
        'Transparencia: cuándo y cómo declarar que has usado IA.',
        'Responsabilidad sobre lo que entregas.',
        'Privacidad: qué no compartir nunca con un chatbot.',
      ],
    },
    bloque_b: {
      title: 'Específico para español',
      items: [
        'Políticas de centros de español (CLM-UGR, Instituto Cervantes).',
        'Cómo documentar tu proceso de aprendizaje con IA.',
        'La IA y los exámenes DELE/SIELE: qué está permitido.',
      ],
    },
    activity: 'Tu declaración personal de uso ético de la IA en español.',
    video: { duration: '4 min', type: 'locución' },
  },
  {
    id: 'practica',
    num: 'V',
    title: 'Práctica',
    subtitle: 'La IA como compañera: ocho escenarios',
    duration: '60 min',
    free: true,
    scenarios: [
      {
        num: 1,
        icon: '🗣️',
        title: 'Conversación',
        text: 'Preparar una conversación sobre un tema que te cuesta. La IA como interlocutor paciente adaptado a tu nivel.',
      },
      {
        num: 2,
        icon: '✍️',
        title: 'Escritura',
        text: 'Mejorar un texto que tú has producido. El ciclo: escribes → la IA comenta → tú revisas → tú aprendes.',
      },
      {
        num: 3,
        icon: '📖',
        title: 'Vocabulario en contexto',
        text: 'Aprender vocabulario nuevo a través de situaciones reales, no de listas.',
      },
      {
        num: 4,
        icon: '🎓',
        title: 'Preparación de exámenes',
        text: 'Preparar el DELE o SIELE usando la IA como preparador, no como trampa.',
      },
      {
        num: 5,
        icon: '🧭',
        title: 'Tu entorno personal de aprendizaje',
        text: 'Construir tu propio sistema de aprendizaje de español con IA: rutinas, herramientas, objetivos.',
      },
      {
        num: 6,
        icon: '🔬',
        title: 'Gramática activa',
        text: 'La IA como gramático socrático. No «explícame el subjuntivo» sino «hazme descubrir el subjuntivo».',
      },
      {
        num: 7,
        icon: '🌐',
        title: 'Lingüística contrastiva',
        text: 'La IA como puente entre tu lengua y el español. Especialmente útil para hablantes de japonés, coreano, chino o árabe.',
      },
      {
        num: 8,
        icon: '🏛️',
        title: 'Cultura como competencia',
        text: 'La cultura no como lista de fiestas, sino como sistema de valores que determina cómo se usa la lengua.',
      },
    ],
    activity: 'Portfolio final: cinco evidencias de uso de la IA con reflexión. En español.',
    video: { duration: '6 min', type: 'locución con ejemplos' },
  },
];

export default function AprendePrograma() {
  return (
    <FreeCourseProtected>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag="Programa completo"
          title="6 módulos para aprender español con IA"
          desc="Desde los fundamentos hasta la práctica. Todos gratuitos. Todos accesibles sin registro."
        />
        <div className="inner-content">
          <div className="modules-grid">
            {MODULES.map((m) => (
              <Link
                key={m.id}
                to={`/aprende/modulo/${m.id}`}
                className="module-card"
                data-testid={`programa-mod-${m.num}`}
              >
                <div className={`module-card__header module-card__header--${m.num === '0' ? 'I' : m.num === 'V' ? 'IV' : m.num === 'I' ? 'II' : m.num === 'II' ? 'III' : 'IV'}`}>
                  <span className="module-card__roman">{m.num}</span>
                  <h3 className="module-card__htitle">{m.title}</h3>
                </div>
                <div className="module-card__body">
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--ink-muted)',
                      marginBottom: '0.5rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {m.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--blue-mid)',
                      marginBottom: '1rem',
                    }}
                  >
                    ⏱ {m.duration}
                  </p>
                  {m.submodules ? (
                    <div className="module-card__items">
                      {m.submodules.map((sub, i) => (
                        <div key={i} className="module-card__item">
                          {sub.title}
                        </div>
                      ))}
                    </div>
                  ) : m.scenarios ? (
                    <div className="module-card__items">
                      <div className="module-card__item">
                        8 escenarios prácticos: conversación, escritura, vocabulario, exámenes, entorno personal, gramática, lingüística contrastiva, cultura
                      </div>
                    </div>
                  ) : (
                    <div className="module-card__items">
                      <div className="module-card__item">
                        {m.bloque_a?.title}
                      </div>
                      <div className="module-card__item">
                        {m.bloque_b?.title}
                      </div>
                    </div>
                  )}
                  <div className="module-card__task">
                    <p className="module-card__task-label">📝 Actividad</p>
                    <p className="module-card__task-text">{m.activity}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Referencias */}
          <div style={{ marginTop: '4rem' }}>
            <p className="section__tag">Referencias</p>
            <h2 className="section__title" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
              Este curso se basa en
            </h2>
            <div
              style={{
                background: 'var(--canvas)',
                borderRadius: 'var(--r-md)',
                padding: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--ink-soft)',
                lineHeight: '1.7',
              }}
            >
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>MCER</strong> — Marco Común Europeo de Referencia para las Lenguas · Consejo de Europa, 2001 · Volumen complementario 2021
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>PCIC</strong> — Plan Curricular del Instituto Cervantes · Niveles de referencia para el español
              </p>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Competencias clave del profesorado de lenguas segundas y extranjeras</strong> — Centro Virtual Cervantes — Instituto Cervantes
              </p>
              <p>
                <strong>AI Fluency for Students</strong> — Rick Dakan, Joseph Feller y Anthropic · Licencia CC BY-NC-SA 4.0
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </FreeCourseProtected>
  );
}
