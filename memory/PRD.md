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
