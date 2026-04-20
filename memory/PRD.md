# PRD · La Clase Digital — IA para la enseñanza de ELE

## Problema original
Plataforma de formación docente en `laclasedigital.com` para el curso
«IA para la enseñanza de ELE» (mayo 2026, 20 h, 4 módulos, 3 videotutorías).
Debe incluir: landing pública migrada desde GitHub Pages, auth magic-link,
modelos de datos (users, courses, enrollments, modules, lessons, tasks,
submissions, threads, certificates), flujo de pago con Stripe, lógica de
precio fundador (149 €) / estándar (250 €) con 20 plazas fundador,
dashboard del estudiante, entregas con feedback, foros por tarea,
panel de administración y certificados.

## Stack utilizado
- Backend: FastAPI + MongoDB (Motor) + emergentintegrations (Stripe) + Resend + JWT
- Frontend: React 19 + React Router v7 + CSS puro (paleta original preservada) + react-markdown
- Dominio: preview en Emergent, despliegue objetivo en Vercel + dominio `laclasedigital.com`

## Arquitectura y datos
Modelos en MongoDB: `users`, `courses`, `enrollments`, `modules`, `lessons`,
`tasks`, `submissions`, `threads`, `payment_transactions`. Todos usan `id`
string UUID (no ObjectId serializable), datetimes en ISO. Seed automático
al startup del curso `ia-ele` con 4 módulos, 8 lecciones y 4 tareas.

## Personas
- **Javier (admin)**: `benitezl@go.ugr.es`. Gestiona curso, inscripciones,
  desbloqueos, feedback a entregas, plazas fundador.
- **Docente inscrito (student)**: accede con magic link, cursa módulos
  secuenciales, entrega tareas, recibe feedback, participa en foros.
- **Visitante**: navega landing, ve precios, se inscribe vía Stripe.

## Requisitos estáticos
- Paleta: azul `#0F4C81`, ámbar `#F5A623`, fondo oscuro `#0A1628`,
  canvas `#F4F7FA`. Tipografías Syne (display) + DM Sans (body) + Playfair.
- Identidad: logo IA·ELE, símbolo `[|]` en footer, franja roja superior.
- Todo bajo `laclasedigital.com` (single domain).

## Implementado en iteración 5 (2026-02 fork)
- ✅ **Navegación entre materiales** en `/recurso/:slug`:
  - Sidebar sticky en desktop con los 17 materiales agrupados por módulo
    (módulo actual → item activo en ámbar).
  - Drawer deslizable en móvil con botón "📚 Índice de materiales".
  - Breadcrumb clicable arriba: `Mis cursos › Curso › Módulo N › Título`.
  - Botones **Anterior / Siguiente** al final del contenido con título
    del recurso, respetando el orden del curso y marcando "primer/último".
  - Backend: `/api/resource/{slug}` ahora incluye `course_slug`,
    `course_title`, `module_order`, `module_title` para el contexto.
- ✅ **Fix visor Markdown**: `remark-gfm` + CSS `overflow-x:auto` /
  `word-break:break-word` en `<pre>/<code>`, los prompts largos no desbordan.
- ✅ **Fix generador PDF**: `MarkdownToPDF` reescrito con buffers/flush para
  fences y tablas GFM. Validado con testing agent v4 (5/5 frontend pass).

## Implementado en iteración 4 (2026-04-20)
- ✅ **Sistema de recursos del curso** importado automáticamente desde
  `/app/legacy/materiales/**/*.md`. Colección `resources` en MongoDB.
  17 materiales activos: 4 M1 · 3 M2 · 5 M3 · 3 M4 · 2 transversales.
  Excluidos: vídeos (uso personal del formador) y guías Moodle.
- ✅ **Visor de recurso** `/recurso/:slug` con ReactMarkdown + botón
  "📄 Descargar PDF" en plantillas/rúbricas/glosario (generación
  on-the-fly con `@react-pdf/renderer` replicando el estilo de la
  plantilla original: franja ámbar, cabecera/pie con nombre del
  formador, tipografía Helvetica y colores `#F5A623` / `#0F4C81` /
  `#FEF6DC`).
- ✅ **Índice de materiales** `/curso/:slug/recursos` con recursos
  agrupados por módulo + sección transversal. Cards con emoji por
  tipo y hover con transición a ámbar.
- ✅ **Sección "📚 Materiales de este módulo"** en cada página de
  módulo, listando solo los recursos de ese módulo.
- ✅ **Botón "📚 Materiales"** en dashboard junto al CTA del curso.
- ✅ **Normalización inteligente de títulos**: salta "ÍNDICE",
  convierte shouty-caps a sentence case pero respeta acrónimos
  (ELE, IA, MCER, A1-C2).
- ✅ **Eliminar inscripciones desde admin** con botón 🗑 — borra
  todo lo relacionado (entregas, foros, progreso, certificados) y
  restaura la plaza fundador si aplica.
- ✅ **Reescanear materiales** con botón 🔄 en admin
  (`POST /api/admin/resources/reseed`) para importar nuevos `.md`
  sin reiniciar el servidor.
- ✅ **Stripe + webhook** ahora usa el SDK oficial directamente
  (bypass del wrapper que daba bugs de Pydantic con `StripeObject`).
- ✅ **Reply-To dinámico en contacto y cuestionario**: el correo
  del visitante se pone como Reply-To para que el admin responda
  con un clic.

## Implementado en iteración 3 (2026-04-20)
- ✅ **Cuestionario de diagnóstico** `/cuestionario` portado del legacy:
  27 preguntas en 4 bloques (perfil · práctica · IA · expectativas),
  Likert 1-5, radio, checkbox, textarea. Scoring con 3 dimensiones
  (práctica/actitud/uso) ponderadas 40/30/30 → 4 perfiles A/B/C/D
  con descripción personalizada y módulos clave. Backend guarda en
  `quiz_results` y envía email al admin con reply-to al visitante.
- ✅ **Dashboard con barra de progreso por curso**: lecciones vistas
  (`user_progress`), entregas enviadas/revisadas, porcentaje global.
  Las lecciones se marcan como vistas automáticamente al entrar al módulo.
  CTA cambia a "Continuar curso →" si hay progreso > 0.
- ✅ **Exportar inscripciones a CSV** desde panel admin: GET
  `/api/admin/export/enrollments.csv` con Content-Type correcto y
  descarga automática con fetch+Bearer+Blob. Columnas:
  `enrollment_id, email, nombre, curso, importe_eur, was_founder,
   status, paid_at, stripe_payment_id`.
- ✅ **Admin responsive refinado**: tabla con scroll horizontal en
  móvil, botón export al lado del título de la sección.
- ✅ **Nuevos formularios con fondo de Reply-To dinámico**: el contacto
  y el quiz envían emails al admin con `reply_to` = email del visitante.
- ✅ Backend 49/49 tests passed (11 nuevos + 38 regresión).

## Implementado en iteración 2 (2026-04-20)
- ✅ **Contador plazas fundador** global: banner fijo en el top con cierre
  (session-based) y chip en la navbar con número de plazas restantes
  animado y link a precios. Fuente: `GET /api/courses/ia-ele`.
- ✅ **founder_seats_taken=3** registrado en DB (3 inscripciones reales
  gestionadas directamente por el formador; se reflejan en todo el site).
- ✅ **Stripe test keys reales** configuradas (`sk_test_91ZV...`) —
  flujo de Checkout verificado end-to-end generando URLs reales.
- ✅ **Subida real de archivos** en entregas con Cloudinary (drag-and-drop,
  barra de progreso, hasta 20 MB). Endpoint `/api/upload` autenticado.
- ✅ **Certificados PDF** con `@react-pdf/renderer`: emisión desde
  `/admin` (botón 🏅 Emitir en cada inscripción), vista pública en
  `/certificado/:id` con visor y descarga PDF. Diseño: franja ámbar,
  símbolo `[|]`, nombre, curso, horas, fecha, ID de verificación.
  Email automático al estudiante. Idempotente (no duplica).
- ✅ **Reordenar módulos en admin** con botones ▲▼ junto a cada módulo.
- ✅ **Email al admin al inscribirse** nuevo estudiante (además del de
  bienvenida al estudiante).
- ✅ Backend 100% (38/38 tests): 15 nuevos + 23 regresión.

## Implementado en iteración 1 (2026-04-20)
- ✅ Migración fiel de la landing: `/`, `/descripcion`, `/programa`,
  `/calendario`, `/metodologia`, `/precios`, `/sobre-mi` (React).
- ✅ Auth magic-link (JWT 30 d + token firmado 30 min) vía Resend.
- ✅ Modelos y seed automático del curso `ia-ele` (149 €/250 €, 20 plazas).
- ✅ `/inscripcion/:slug` → Stripe Checkout → webhook + polling
  (`/api/checkout/status/{session_id}`) con fallback graceful si Stripe
  no responde. `payment_transactions` registra cada flujo.
- ✅ Lógica fundador/estándar: precio decidido en backend según
  `is_founder_edition` y `founder_seats_taken`; al agotar plazas el flag
  se desactiva automáticamente.
- ✅ Dashboard `/dashboard` con lista de cursos inscritos.
- ✅ `/curso/:slug` con módulos secuenciales (bloqueados/desbloqueados),
  lecciones Markdown, tareas con entrega (textarea + URL adjunta) e
  historial de entregas + feedback.
- ✅ `/curso/:slug/tarea/:taskId/foro`: hilos por tarea, respuestas a
  un nivel, notificación email al formador.
- ✅ Panel `/admin`: inscritos con precio pagado y badge fundador,
  entregas pendientes con formulario de feedback+nota, toggle
  `is_founder_edition`, desbloqueo manual de módulos.
- ✅ Emails transaccionales Resend: magic link, bienvenida con precio
  pagado, nueva entrega (al admin), feedback disponible (al estudiante).
- ✅ Testing backend: 22/23 pytest passed; bug HIGH de `/checkout/status`
  corregido y verificado manualmente.

## Backlog priorizado
**P0 — Integraciones reales**
- Reemplazar `sk_test_emergent` por las Stripe test/live keys del
  usuario. Configurar webhook nuevo en Stripe Dashboard apuntando a
  `https://laclasedigital.com/api/webhook/stripe`.
- Verificar dominio `laclasedigital.com` en Resend (Resend rechazó el
  envío con 403 "domain not verified"). Hasta entonces los emails no
  llegan aunque la API responde 200.

**P1 — Features pendientes del briefing**
- Certificados en PDF con `@react-pdf/renderer`, página pública
  `/certificado/:id`, email al estudiante, PDF con logo IA·ELE y `[|]`.
- Drag-and-drop de reordenar módulos en admin (actualmente solo toggle).
- Subida real de archivos para entregas (ahora se acepta URL externa).
- Notificación al formador al inscribirse un nuevo estudiante.

**P2 — Mejoras de producto**
- Dashboard con barra de progreso por curso y tiempo total invertido.
- Admin: exportar inscripciones a CSV.
- Landing: cuestionario-diagnóstico (existe en legacy, se puede portar).
- Sistema de cupones (marcado como fuera de alcance en el briefing).

## Despliegue
- Preview: `https://teach-preview.preview.emergentagent.com`
- Producción objetivo: Vercel + dominio `laclasedigital.com`.
- Variables a configurar en producción: `MONGO_URL`, `DB_NAME`,
  `JWT_SECRET`, `MAGIC_LINK_SECRET`, `STRIPE_API_KEY`, `RESEND_API_KEY`,
  `RESEND_FROM`, `ADMIN_EMAIL`, `FRONTEND_ORIGIN`.

## Credenciales de test
Ver `/app/memory/test_credentials.md`.
