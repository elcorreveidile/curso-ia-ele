// Questionnaire data ported from legacy /cuestionario-curso.html
// 27 questions in 4 blocks + scoring for 4 teacher profiles (A/B/C/D)

export const BLOCKS = [
  { id: 'A', title: 'Perfil docente', icon: '👤' },
  { id: 'B', title: 'Práctica docente actual', icon: '📚' },
  { id: 'C', title: 'IA en ELE', icon: '🤖' },
  { id: 'D', title: 'Expectativas del curso', icon: '🎯' },
];

export const QUESTIONS = [
  // BLOCK A — Perfil docente
  { block: 'A', id: 'nombre', text: 'Nombre y apellidos', type: 'text', required: true },
  { block: 'A', id: 'email', text: 'Correo electrónico', type: 'email', required: true },
  { block: 'A', id: 'anos_exp', text: '¿Cuántos años llevas ejerciendo como docente de ELE?', type: 'radio', required: true, options: ['Menos de 2 años','Entre 2 y 5 años','Entre 6 y 15 años','Más de 15 años'] },
  { block: 'A', id: 'niveles_mcer', text: '¿Con qué niveles del MCER trabajas habitualmente? (puedes marcar más de uno)', type: 'checkbox', options: ['A1-A2 · Básico','B1-B2 · Intermedio','C1-C2 · Avanzado','Todos los niveles'] },
  { block: 'A', id: 'programas', text: '¿En qué tipo de programas impartes clase? (puedes marcar más de uno)', type: 'checkbox', options: ['CEH · Estudios Hispánicos','CLCE · Lengua y Cultura','CILE · Intensivos','CELE · ELE','Formación de profesores','Study Abroad','Cursos de especial diseño','Preparación exámenes de acreditación'] },
  { block: 'A', id: 'modalidad', text: '¿Cuál es tu modalidad de enseñanza predominante?', type: 'radio', options: ['Presencial','Semipresencial (blended)','Totalmente en línea','Depende del programa y el grupo'] },

  // BLOCK B — Práctica docente actual
  { block: 'B', id: 'tiempo_prep', text: '¿Cuánto tiempo dedicas a preparar una clase de 90 minutos?', type: 'radio', options: ['Menos de 30 minutos','Entre 30 y 60 minutos','Entre 1 y 2 horas','Más de 2 horas'] },
  { block: 'B', id: 'fuentes_mat', text: '¿De dónde obtienes tus materiales didácticos? (puedes marcar más de uno)', type: 'checkbox', options: ['Manuales de ELE publicados','Elaboración propia desde cero','Adaptación de recursos auténticos','Repositorios online (profedeele, marcoele…)','Materiales de compañeros/as','IA generativa (ChatGPT, Claude…)'] },
  { block: 'B', id: 'herramientas_dig', text: '¿Qué herramientas digitales usas actualmente? (puedes marcar más de uno)', type: 'checkbox', options: ['Aula Virtual / Moodle','Presentaciones (PowerPoint, Canva, Slides)','Quizlet, Kahoot, Genially','Vídeos (YouTube, series)','Podcasts o audio','Pizarra digital','Grabaciones propias','Principalmente sin herramientas digitales'] },
  { block: 'B', id: 'dificultad_plan', text: '¿Cuál es tu mayor dificultad al planificar?', type: 'radio', options: ['Falta de tiempo','Encontrar recursos auténticos','Adaptar a grupos diversos','Alinear con MCER','Variedad de actividades','No tengo dificultades'] },
  // Likert 1-5 (scoring pd1..pd6)
  { block: 'B', id: 'pd1', text: 'Me resulta fácil diseñar secuencias didácticas coherentes y progresivas.', type: 'likert' },
  { block: 'B', id: 'pd2', text: 'Consulto habitualmente el MCER al diseñar mis materiales.', type: 'likert' },
  { block: 'B', id: 'pd3', text: 'Integro con fluidez componentes culturales en mis clases.', type: 'likert' },
  { block: 'B', id: 'pd4', text: 'Adapto mis materiales a grupos con distintos perfiles.', type: 'likert' },
  { block: 'B', id: 'pd5', text: 'Genero actividades variadas que trabajan las distintas destrezas.', type: 'likert' },
  { block: 'B', id: 'pd6', text: 'Creo y uso recursos multimodales (imagen, audio, vídeo) con regularidad.', type: 'likert' },

  // BLOCK C — IA en ELE
  { block: 'C', id: 'freq_ia', text: '¿Con qué frecuencia usas IA en tu preparación?', type: 'radio', options: ['Nunca','Lo he probado puntualmente','Ocasionalmente','Habitualmente','A diario'] },
  { block: 'C', id: 'uso_ia_ele', text: 'Si has usado IA para ELE, ¿para qué? (puedes marcar más de uno)', type: 'checkbox', options: ['Generar textos o actividades','Ejercicios de gramática/vocabulario','Diseñar planes de clase','Generar imágenes','Crear audios/diálogos','Feedback a producciones escritas','Adaptar nivel MCER','Todavía no la he usado'] },
  { block: 'C', id: 'herr_ia', text: '¿Qué herramientas IA conoces? (marca las que conozcas aunque sea de nombre)', type: 'checkbox', options: ['ChatGPT','Claude (Anthropic)','Gemini (Google)','Microsoft Copilot','Midjourney / DALL-E','ElevenLabs','Canva con IA','Ninguna de estas'] },
  { block: 'C', id: 'ia1', text: 'La IA puede ayudarme a ahorrar tiempo en mis clases.', type: 'likert' },
  { block: 'C', id: 'ia2', text: 'Los materiales de IA pueden carecer de autenticidad cultural.', type: 'likert' },
  { block: 'C', id: 'ia3', text: 'Soy capaz de supervisar críticamente lo que genera la IA.', type: 'likert' },
  { block: 'C', id: 'ia4', text: 'Me preocupa que el alumnado use la IA para eludir el aprendizaje.', type: 'likert' },
  { block: 'C', id: 'ia5', text: 'Estoy dispuesto/a a integrar la IA como herramienta habitual.', type: 'likert' },
  { block: 'C', id: 'ia6', text: 'Me siento preparado/a para usar la IA con ética.', type: 'likert' },
  { block: 'C', id: 'ia7', text: 'La IA puede personalizar materiales al nivel de mi alumnado.', type: 'likert' },

  // BLOCK D — Expectativas
  { block: 'D', id: 'objetivo_curso', text: '¿Cuál es tu objetivo principal con este curso?', type: 'radio', options: ['Ahorrar tiempo en la preparación','Mejorar la calidad de los materiales','Usar la IA con criterio y responsabilidad','Actualizarme profesionalmente','Crear recursos multimodales','Diseñar asistentes propios'] },
  { block: 'D', id: 'modulo_interes', text: '¿Qué módulo te genera más expectativa?', type: 'radio', options: ['Módulo I · Ética y prompts','Módulo II · Chatbots a medida','Módulo III · Planificar con IA y MCER','Módulo IV · Recursos multimodales'] },
  { block: 'D', id: 'preocupacion', text: '¿Qué aspecto del uso de la IA en ELE te preocupa más?', type: 'radio', options: ['Calidad lingüística y cultural','Uso del alumnado para evitar aprendizaje','Privacidad de datos','Dependencia tecnológica','No saber usarla con criterio','No me preocupa'] },
  { block: 'D', id: 'expectativa_concreta', text: '¿Hay algo concreto que quieras poder hacer con IA al acabar el curso?', type: 'textarea' },
  { block: 'D', id: 'contexto_especial', text: '¿Hay alguna característica especial de tu grupo docente que debería tenerse en cuenta?', type: 'textarea' },
];

export const PROFILES = {
  A: {
    name: 'Docente digital en transición',
    emoji: '🌱',
    color: '#0F4C81',
    desc: 'Tienes una práctica docente sólida y consolidada, pero hasta ahora la IA ha sido ajena a tu rutina. Es una ventaja: llegas al curso sin hábitos incorrectos. En 4 semanas puedes transformar tu forma de preparar clases.',
    modules: ['Módulo I (imprescindible)', 'Módulo II (construir asistentes)', 'Módulo III (planificación con MCER)'],
  },
  B: {
    name: 'Explorador/a de la IA en ELE',
    emoji: '🔍',
    color: '#1B6CA8',
    desc: 'Has dado los primeros pasos con la IA y has visto sus posibilidades, pero tu uso todavía es intuitivo y sin método sistemático. Este curso te dará lo que te falta: criterio, estructura y práctica deliberada aplicada a ELE.',
    modules: ['Módulo I (ética)', 'Módulo II (asistentes)', 'Módulo III (plantillas MCER)', 'Módulo IV (multimodales)'],
  },
  C: {
    name: 'Integrador/a activo/a',
    emoji: '🚀',
    color: '#F5A623',
    desc: 'Usas la IA con regularidad en tu docencia y ya has visto resultados concretos. Tu reto ahora es ir más allá: sistematizar, crear herramientas propias y recursos multimodales de calidad que enriquezcan tus clases.',
    modules: ['Módulo II (avanzado)', 'Módulo III (mini apps)', 'Módulo IV (multimodal)'],
  },
  D: {
    name: 'Docente innovador/a',
    emoji: '⭐',
    color: '#1A7A52',
    desc: 'Dominas la IA aplicada a ELE con criterio y creatividad. Tu reto: llevar esto al siguiente nivel — sistemas reutilizables, liderar la innovación en tu centro y compartir tu conocimiento.',
    modules: ['Módulo III (automatización)', 'Módulo IV (producción avanzada)', 'Co-creación con el formador'],
  },
};

const FREQ_SCORE = { 'Nunca': 0, 'Lo he probado puntualmente': 25, 'Ocasionalmente': 50, 'Habitualmente': 75, 'A diario': 100 };

export function calcProfile(vals) {
  const likert = (key) => Number(vals[key] || 0);
  const avg = (keys) => {
    const nums = keys.map(likert).filter((n) => n > 0);
    return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
  };
  const scale = (v) => v > 0 ? ((v - 1) / 4) * 100 : 0;

  const practice = scale(avg(['pd1','pd2','pd3','pd4','pd5','pd6']));

  // Attitude: invert "preocupación" items (ia2, ia4) so low=good, high=bad becomes inverted
  const attitudeItems = ['ia1','ia3','ia5','ia6','ia7'];
  const attitude = scale(avg(attitudeItems));

  // Usage
  const freq = FREQ_SCORE[vals.freq_ia] ?? 0;
  const usos = Array.isArray(vals.uso_ia_ele) ? vals.uso_ia_ele.filter((v) => v !== 'Todavía no la he usado').length : 0;
  const usoPct = Math.min(usos / 6, 1) * 100;
  const usage = freq * 0.5 + usoPct * 0.5;

  const total = practice * 0.4 + attitude * 0.3 + usage * 0.3;

  let key = 'A';
  if (total >= 75) key = 'D';
  else if (total >= 55) key = 'C';
  else if (total >= 30) key = 'B';

  return { key, profile: PROFILES[key], total: Math.round(total), dimensions: { practice, attitude, usage } };
}
