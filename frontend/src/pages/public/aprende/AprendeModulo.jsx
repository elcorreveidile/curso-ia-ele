import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHero from '../../../components/PageHero';
import FreeCourseProtected from '../../../components/FreeCourseProtected';

const MODULES = {
  intro: {
    id: 'intro',
    num: '0',
    title: 'Introducción y punto de partida',
    subtitle: '¿Para qué sirve este curso?',
    duration: '70 min',
    submodules: [
      {
        id: '0a',
        title: '0-A · Introducción al curso',
        video: { duration: '3 min', type: 'locución' },
        content: [
          {
            type: 'video',
            title: 'VÍDEO DE BIENVENIDA',
            duration: '~3 minutos',
            format: 'Locución con pantalla o presentación simple',
            subtitle: 'Sí (español)',
          },
          {
            type: 'reading',
            title: 'LECTURA — Usar la IA para aprender español: lo que nadie te cuenta',
            sections: [
              {
                heading: 'La trampa de la facilidad',
                text: 'La inteligencia artificial puede hacer muchas cosas por ti: traducir, corregir, generar textos, explicar gramática, inventar diálogos, resumir artículos. Todo en segundos y, en muchos casos, con una calidad razonable.\n\nPero hay algo que la IA no puede hacer por ti: aprender.\n\nAprender una lengua no es acumular información sobre esa lengua. Es desarrollar la capacidad de usarla — de producir y comprender significado en tiempo real, en contextos reales, con personas reales. Esa capacidad solo se construye a través del esfuerzo cognitivo del propio aprendiente. No hay atajo.',
              },
              {
                heading: 'La oportunidad real',
                text: 'Dicho esto, la IA también ofrece algo que no había existido antes para los estudiantes de lenguas: un interlocutor disponible en cualquier momento, capaz de adaptarse a tu nivel, infinitamente paciente, que no se cansa de repetir, que puede simular cualquier situación comunicativa, que puede explicar lo mismo de diez formas distintas hasta que una tenga sentido para ti.\n\nBien usada, la IA puede ser el mejor compañero de aprendizaje que hayas tenido.',
              },
              {
                heading: 'El marco de este curso: las 4D',
                text: 'Para ayudarte a tomar esas decisiones con criterio, este curso usa un marco llamado las 4D, desarrollado por Rick Dakan, Joseph Feller y Anthropic en el programa AI Fluency for Students, y adaptado aquí para el aprendizaje de español.\n\n**Delegación** — Decidir qué trabajo haces tú, qué trabajo hace la IA, y qué trabajo hacéis juntos.\n\n**Descripción** — Saber comunicarle a la IA exactamente lo que necesitas.\n\n**Discernimiento** — Evaluar críticamente lo que la IA produce.\n\n**Diligencia** — Usar la IA con honestidad y responsabilidad.',
              },
              {
                heading: 'Qué necesitas para este curso',
                text: 'No necesitas experiencia previa con herramientas de IA. Si has usado alguna vez un chatbot — ChatGPT, Gemini, Claude, o cualquier otro — tienes suficiente. Si no has usado ninguno, en el Módulo 0-B te explicamos cómo empezar.\n\nSí necesitas disposición a experimentar, equivocarte y reflexionar sobre lo que pasa en esas interacciones. Y sobre todo, disposición a hacer el trabajo. La IA no aprende español por ti. Tú sí.',
              },
            ],
          },
          {
            type: 'activity',
            title: 'ACTIVIDAD 0-A — Mi punto de partida',
            subtitle: 'Tipo: Reflexión escrita + primera interacción con IA',
            duration: '20-30 minutos',
            level: 'A2–C2',
            note: 'Esta actividad no se entrega a nadie. Es para ti. La guardarás en tu repositorio GitHub — que crearás en el Módulo 0-B — como punto de partida de tu portfolio de aprendizaje.',
            parts: [
              {
                heading: 'Parte 1 · Reflexión personal (10 minutos)',
                text: 'Antes de abrir ninguna herramienta de IA, responde estas preguntas por escrito. No hay respuestas correctas o incorrectas.\n\n1. ¿En qué nivel del MCER estás ahora mismo? (A1 / A2 / B1 / B2 / C1 / C2)\n\n2. ¿Has usado alguna vez la IA para aprender español? Si es así, ¿cómo?\n\n3. ¿Qué es lo que más te cuesta del español en este momento?\n\n4. ¿Qué crees que la IA podría hacer por ti que sería útil para aprender?\n\n5. ¿Hay algo que la IA podría hacer por ti que en realidad te impediría aprender?',
              },
              {
                heading: 'Parte 2 · Primera interacción con criterio (15 minutos)',
                text: 'Abre tu chatbot de IA preferido (ChatGPT, Claude, Gemini u otro) y realiza la siguiente interacción.\n\nPrompt: "Voy a usar la IA para mejorar mi español. Estoy en el nivel [TU NIVEL]. Lo que más me cuesta ahora mismo es [TU DIFICULTAD]. Quiero que en esta conversación actúes como un tutor de español que me ayuda a pensar, no como alguien que me da las respuestas directamente. Empieza preguntándome qué quiero conseguir con el español y por qué."\n\nMantén la conversación durante al menos cinco intercambios.',
              },
              {
                heading: 'Parte 3 · Reflexión final (5 minutos)',
                text: 'Después de la conversación, responde brevemente:\n\n1. ¿Cómo fue diferente esta conversación a las que has tenido antes con una IA?\n\n2. ¿Aprendiste algo o solo completaste una tarea?\n\n3. ¿Cambiarías algo del prompt si lo hicieras otra vez?',
              },
            ],
            resources: [
              { title: 'Test de nivel del Instituto Cervantes', url: 'https://cervantes.org/es/aprender-ensenar/aprende-espanol/test-de-nivel' },
              { title: 'AI Fluency for Students (Anthropic, CC BY-NC-SA 4.0)', url: 'https://www.anthropic.com/education' },
              { title: 'MCER — Autoevaluación de nivel', url: 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/marco/cap_03.htm' },
            ],
          },
        ],
        activity: 'Mi punto de partida: reflexión escrita + primera interacción con IA.',
      },
      {
        id: '0b',
        title: '0-B · Tu espacio de aprendizaje en GitHub',
        video: { duration: '4 min', type: 'grabación de pantalla' },
        content: [
          {
            type: 'video',
            title: 'VÍDEO DE INTRODUCCIÓN A GITHUB',
            duration: '~4 minutos',
            format: 'Grabación de pantalla en directo',
            subtitle: 'Sí (español)',
          },
          {
            type: 'reading',
            title: 'LECTURA — Qué es GitHub y para qué lo usamos en este curso',
            sections: [
              {
                heading: 'GitHub no es solo para programadores',
                text: 'GitHub nació como una herramienta para que los programadores guardaran y compartieran su código. Pero hoy la usan escritores, diseñadores, investigadores, periodistas y, ahora, estudiantes de idiomas.\n\nLo que hace especial a GitHub es una cosa: guarda el historial completo de todo lo que subes.',
              },
              {
                heading: 'Tu repositorio: tu cuaderno de aprendizaje digital',
                text: 'En este curso, tu repositorio de GitHub va a ser tu cuaderno personal. Ahí guardarás:\n\n📁 Las reflexiones de cada módulo — tus respuestas a las preguntas de cada actividad, escritas en español.\n\n📝 Los prompts que vayas creando — los que funcionen, los que no funcionen, y por qué.\n\n🗣️ Tu portfolio de aprendizaje — la evidencia de tu progreso en español a lo largo del curso.',
              },
              {
                heading: 'GitHub es gratis',
                text: 'No necesitas pagar nada. La cuenta básica de GitHub es completamente gratuita e incluye todo lo que necesitas para este curso.',
              },
            ],
          },
          {
            type: 'guide',
            title: 'GUÍA PASO A PASO',
            steps: [
              {
                num: 1,
                title: 'Crear tu cuenta en GitHub',
                time: '5 minutos',
                content: '1. Abre tu navegador y ve a https://github.com\n2. Haz clic en el botón verde "Sign up" (Registrarse).\n3. Rellena el formulario con correo, contraseña y nombre de usuario.\n4. Verifica tu correo electrónico.',
              },
              {
                num: 2,
                title: 'Crear tu repositorio del curso',
                time: '3 minutos',
                content: '1. Haz clic en el + (esquina superior derecha).\n2. Selecciona "New repository".\n3. Nombre: aprende-espanol-ia (minúsculas, con guiones)\n4. Descripción: Mi portfolio de aprendizaje · Curso IA y español\n5. Elige Private (privado) o Public (público)\n6. Haz clic en "Create repository".',
              },
              {
                num: 3,
                title: 'Subir tu primera actividad',
                time: '5 minutos',
                content: '1. En tu repositorio, haz clic en "Add file" → "Upload files".\n2. Arrastra tu archivo modulo-0-punto-de-partida.txt\n3. En "Commit changes" escribe: "Módulo 0 · Mi punto de partida"\n4. Haz clic en "Commit changes".',
              },
            ],
          },
          {
            type: 'activity',
            title: 'ACTIVIDAD 0-B — Tu repositorio listo',
            checklist: [
              'He creado mi cuenta en GitHub',
              'He verificado mi correo electrónico',
              'He configurado mi perfil (nombre + bio)',
              'He creado el repositorio aprende-espanol-ia',
              'He subido el archivo modulo-0-punto-de-partida.txt',
            ],
          },
        ],
        activity: 'Repositorio GitHub creado + primer archivo subido.',
      },
    ],
  },
  delegacion: {
    id: 'delegacion',
    num: 'I',
    title: 'Delegación',
    subtitle: '¿Qué dejas en manos de la IA?',
    duration: '30 min',
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
  descripcion: {
    id: 'descripcion',
    num: 'II',
    title: 'Descripción',
    subtitle: 'Cómo hablarle a la IA para que te ayude a aprender',
    duration: '35 min',
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
  discernimiento: {
    id: 'discernimiento',
    num: 'III',
    title: 'Discernimiento',
    subtitle: 'Cómo evaluar lo que te da la IA',
    duration: '30 min',
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
  diligencia: {
    id: 'diligencia',
    num: 'IV',
    title: 'Diligencia',
    subtitle: 'Usar la IA con responsabilidad',
    duration: '25 min',
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
  practica: {
    id: 'practica',
    num: 'V',
    title: 'Práctica',
    subtitle: 'La IA como compañera: ocho escenarios',
    duration: '60 min',
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
};

export default function AprendeModulo() {
  const { id } = useParams();
  const module = MODULES[id];

  if (!module) {
    return (
      <>
        <Navbar />
        <div className="inner-page">
          <div className="inner-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h1 style={{ marginBottom: '1rem' }}>Módulo no encontrado</h1>
            <p style={{ marginBottom: '2rem' }}>El módulo que buscas no existe.</p>
            <Link to="/aprende/programa" className="btn btn--primary">
              Volver al programa
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <FreeCourseProtected>
      <Navbar />
      <div className="inner-page">
        <PageHero
          tag={`Módulo ${module.num}`}
          title={module.title}
          desc={module.subtitle}
        />
        <div className="inner-content">
          {/* Módulo 0: submódulos */}
          {module.submodules && (
            <div>
              {module.submodules.map((sub, idx) => (
                <div
                  key={sub.id}
                  style={{
                    background: idx % 2 === 0 ? 'var(--canvas)' : '#D6E8F7',
                    borderRadius: 'var(--r-lg)',
                    padding: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.6rem',
                      fontWeight: '700',
                      color: 'var(--ink)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {sub.title}
                  </h2>

                  {/* Video info */}
                  {sub.video && (
                    <div
                      style={{
                        background: 'var(--white)',
                        borderRadius: 'var(--r-md)',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📹</span>
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--ink)', margin: 0 }}>
                          Vídeo: {sub.video.duration}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>
                          Formato: {sub.video.type}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Content sections */}
                  {sub.content && sub.content.map((content, contentIdx) => (
                    <div key={contentIdx} style={{ marginBottom: '2rem' }}>
                      {content.type === 'video' && (
                        <div
                          style={{
                            background: 'var(--white)',
                            borderRadius: 'var(--r-md)',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: 'var(--blue-mid)',
                              marginBottom: '0.5rem',
                            }}
                          >
                            {content.title}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '0.25rem' }}>
                            <strong>Duración:</strong> {content.duration}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '0.25rem' }}>
                            <strong>Formato:</strong> {content.format}
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', margin: 0 }}>
                            <strong>Subtítulos:</strong> {content.subtitle}
                          </p>
                        </div>
                      )}

                      {content.type === 'reading' && (
                        <div>
                          <h3
                            style={{
                                                              fontFamily: 'var(--font-display)',
                              fontSize: '1.2rem',
                              fontWeight: '700',
                              color: 'var(--ink)',
                              marginBottom: '1rem',
                            }}
                          >
                            {content.title}
                          </h3>
                          {content.sections && content.sections.map((section, sectionIdx) => (
                            <div key={sectionIdx} style={{ marginBottom: '1.5rem' }}>
                              <h4
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  color: 'var(--ink)',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                {section.heading}
                              </h4>
                              <p
                                style={{
                                  fontSize: '0.95rem',
                                  color: 'var(--ink-soft)',
                                  lineHeight: '1.7',
                                  whiteSpace: 'pre-line',
                                }}
                              >
                                {section.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {content.type === 'activity' && (
                        <div
                          style={{
                            background: 'var(--white)',
                            borderLeft: '4px solid var(--clm-red)',
                            borderRadius: 'var(--r-md)',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <p
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: 'var(--clm-red)',
                              marginBottom: '0.5rem',
                            }}
                          >
                            📝 {content.title}
                          </p>
                          {content.subtitle && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
                              <strong>Tipo:</strong> {content.subtitle} · <strong>Duración:</strong> {content.duration}
                            </p>
                          )}
                          {content.note && (
                            <p
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--ink-muted)',
                                fontStyle: 'italic',
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'var(--canvas)',
                                borderRadius: 'var(--r-sm)',
                              }}
                            >
                              {content.note}
                            </p>
                          )}
                          {content.parts && content.parts.map((part, partIdx) => (
                            <div key={partIdx} style={{ marginBottom: '1rem' }}>
                              <h4
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '600',
                                  color: 'var(--ink)',
                                  marginBottom: '0.5rem',
                                }}
                              >
                                {part.heading}
                              </h4>
                              <p
                                style={{
                                  fontSize: '0.9rem',
                                  color: 'var(--ink-soft)',
                                  lineHeight: '1.6',
                                  whiteSpace: 'pre-line',
                                }}
                              >
                                {part.text}
                              </p>
                            </div>
                          ))}
                          {content.checklist && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                              {content.checklist.map((item, itemIdx) => (
                                <li
                                  key={itemIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--ink-soft)',
                                  }}
                                >
                                  <input type="checkbox" style={{ marginTop: '0.2rem' }} />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {content.resources && (
                            <div style={{ marginTop: '1rem' }}>
                              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                                Recursos útiles:
                              </p>
                              {content.resources.map((resource, resourceIdx) => (
                                <div key={resourceIdx} style={{ marginBottom: '0.5rem' }}>
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.85rem',
                                      color: 'var(--blue-mid)',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    {resource.title}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {content.type === 'guide' && (
                        <div>
                          <h3
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.2rem',
                              fontWeight: '700',
                              color: 'var(--ink)',
                              marginBottom: '1rem',
                            }}
                          >
                            {content.title}
                          </h3>
                          {content.steps && content.steps.map((step) => (
                            <div
                              key={step.num}
                              style={{
                                background: 'var(--white)',
                                borderRadius: 'var(--r-md)',
                                padding: '1rem',
                                marginBottom: '1rem',
                                borderLeft: '3px solid var(--blue)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'var(--blue)',
                                    color: 'var(--white)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                  }}
                                >
                                  {step.num}
                                </span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--ink)' }}>
                                  {step.title}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginLeft: 'auto' }}>
                                  ⏱ {step.time}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'var(--ink-soft)',
                                  lineHeight: '1.6',
                                  whiteSpace: 'pre-line',
                                  margin: 0,
                                }}
                              >
                                {step.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Activity */}
                  <div
                    style={{
                      background: 'var(--white)',
                      borderLeft: '4px solid var(--clm-red)',
                      borderRadius: 'var(--r-md)',
                      padding: '1.5rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--clm-red)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      📝 Actividad
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
                      {sub.activity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Módulos I-IV: Bloques A/B */}
          {module.bloque_a && module.bloque_b && (
            <div>
              <div
                style={{
                  background: 'var(--canvas)',
                  borderRadius: 'var(--r-lg)',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                  }}
                >
                  {module.bloque_a.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {module.bloque_a.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                        fontSize: '0.95rem',
                        color: 'var(--ink-soft)',
                        lineHeight: '1.6',
                      }}
                    >
                      <span
                        style={{
                                                          color: 'var(--orange)',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}
                      >
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  background: '#D6E8F7',
                  borderRadius: 'var(--r-lg)',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                  }}
                >
                  {module.bloque_b.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {module.bloque_b.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                        fontSize: '0.95rem',
                        color: 'var(--ink-soft)',
                        lineHeight: '1.6',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--orange)',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}
                      >
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Video info */}
              {module.video && (
                <div
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📹</span>
                  <div>
                    <p style={{ fontWeight: '600', color: 'var(--ink)', margin: 0 }}>
                      Vídeo: {module.video.duration}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>
                      Formato: {module.video.type}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity */}
              <div
                style={{
                  background: 'var(--white)',
                  borderLeft: '4px solid var(--clm-red)',
                  borderRadius: 'var(--r-md)',
                  padding: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--clm-red)',
                    marginBottom: '0.5rem',
                  }}
                >
                  📝 Actividad
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
                  {module.activity}
                </p>
              </div>
            </div>
          )}

          {/* Módulo V: Escenarios */}
          {module.scenarios && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                {module.scenarios.map((scenario) => (
                  <div
                    key={scenario.num}
                    style={{
                      background: 'var(--white)',
                      borderRadius: 'var(--r-md)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid rgba(14,28,47,.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{scenario.icon}</span>
                      <h4
                        style={{
                          fontFamily: 'var(--font-display)',
                                                          fontSize: '0.95rem',
                          fontWeight: '700',
                          color: 'var(--ink)',
                                                          margin: 0,
                                                        }}
                                                      >
                        {scenario.title}
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0 }}>
                      {scenario.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Video info */}
              {module.video && (
                <div
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📹</span>
                  <div>
                    <p style={{ fontWeight: '600', color: 'var(--ink)', margin: 0 }}>
                      Vídeo: {module.video.duration}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: 0 }}>
                      Formato: {module.video.type}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity */}
              <div
                style={{
                  background: 'var(--white)',
                  borderLeft: '4px solid var(--clm-red)',
                  borderRadius: 'var(--r-md)',
                  padding: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--clm-red)',
                    marginBottom: '0.5rem',
                  }}
                >
                  📝 Actividad final
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: '1.6' }}>
                  {module.activity}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--canvas-alt)' }}>
            <Link to="/aprende/programa" className="btn btn--outline">
              ← Volver al programa
            </Link>
            {id !== 'practica' && (
              <Link to="/sesiones" className="btn btn--primary">
                Reservar una sesión →
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </FreeCourseProtected>
  );
}
