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

## Implementado en iteración 8 (2026-02 fork, sprint 4 · bugfix producción)
- ✅ **PDF del libro en producción** (BUG FIX CRÍTICO): WeasyPrint no
  funcionaba en el deploy nativo porque necesita libs del sistema
  (cairo, pango, gdk-pixbuf). Reescrito `/api/ebook.pdf` con **ReportLab**
  (pure Python, sin system deps). Incluye portada navy + marca ámbar,
  TOC, separadores de parte, headers/footers con número de página.
  Resultado: 557 KB · 246 páginas verificado.
- ✅ **Email de bienvenida mejorado** (post inscripción Stripe):
  saludo por primer nombre (con fallback sensato si el email no parece
  nombre real), badge fundador si corresponde, caja del regalo del
  libro, 4 pasos para empezar, importe + referencia Stripe, CTA a
  login. Envío via send_email(Resend) desde webhook.
- ✅ **Normalización API**: `video_youtube_id` siempre presente (None)
  en todos los módulos del endpoint `/api/course/{slug}/content`.
- ✅ **Testing iter8**: backend 12/12 pytest + frontend 5/5 Playwright.

## Refactor pendiente (prioridad baja)
Dividir `/app/backend/server.py` (~2300 líneas) en routers FastAPI
modulares: auth, courses, dashboard, tasks, ebook, payments, admin,
public. Mejora mantenibilidad y velocidad del IDE. Cero cambio visible
al usuario.

## Implementado en iteración 7 (2026-02 fork, sprint 3)
- ✅ **Regalo del libro en landing**: banner "📘 Incluye de regalo el libro
  *Prompts que funcionan*" en Home hero (contraste ámbar sobre oscuro)
  y bullet en el precio fundador de Precios.
- ✅ **SEO + Open Graph**:
  - Meta tags OG (site_name, locale, image 1200x630, alt) + Twitter Card.
  - JSON-LD con `@graph` Organization + Person (Javier) + Course +
    CourseInstance + Offer (149 €, LimitedAvailability).
  - Generada `public/og-image.png` (91 KB, azul degradado + branding).
  - `public/sitemap.xml` con 9 rutas prioridad 0.6-1.0.
  - `public/robots.txt` permitiendo rutas públicas y bloqueando /api,
    /dashboard, /admin, /libro, /recurso.
- ✅ **Animaciones scroll-reveal**: hook `useScrollReveal` con
  IntersectionObserver, marca above-the-fold como visible inmediatamente
  y aplica fade+slide a elementos below-fold. Aplicado en Home y Precios.
- ✅ **Resultado del cuestionario visual**: tarjeta con emoji + título,
  barras animadas por dimensión (Práctica / Actitud / Uso) con color
  propio cada una, módulos clave con ✓ verde, bloque "Próximos pasos"
  mencionando el libro, botón "Reservar plaza →".
- ✅ **Contador de plazas live**: CourseProvider con polling 60 s +
  refresh al volver de otra pestaña (`visibilitychange`).
- ✅ **Email semanal automático** (APScheduler + Resend):
  - Cron diario 09:00 Europe/Madrid, función `run_inactivity_nudge`.
  - Detecta estudiantes inscritos sin `user_progress.viewed_at` en 7 días,
    respeta grace week para recién inscritos y idempotencia por
    `user.last_nudge_at`.
  - Endpoint admin `POST /api/admin/inactivity/run` para disparo manual.
  - Email HTML con saludo personalizado + CTA "Entrar a mi área".
- ✅ **Modo oscuro** con toggle + `prefers-color-scheme`:
  - Componente `ThemeToggle` en Navbar (☀️/🌙).
  - Variable CSS `--surface` para fondos de tarjetas (evita romper los
    títulos blancos que usaban `var(--white)`).
  - Script inline en `index.html` previene FOUC aplicando `data-theme`
    antes de React.
  - Persistencia en `localStorage.lcd_theme`, respeta `prefers-color-scheme`.
- ✅ **Bugfix contraste**: en iter7.1 arreglé dos reportes del usuario:
  (1) el regalo del libro usaba `color: var(--ink)` que quedaba oscuro
  sobre el hero → ahora texto `#F3F7FC`; (2) en modo oscuro los títulos
  blancos desaparecían porque `--white` se sobrescribía → introducido
  `--surface` para separar "fondo de card" de "color blanco puro".
- ✅ **Testing iter7**: backend 19/19 pytest + frontend 6/6 Playwright
  (nudge idempotency, SEO meta/JSON-LD, sitemap/robots/og-image,
  theme toggle persistencia, cuestionario full flow, regalo landing).

## Implementado en iteración 6 (2026-02 fork, sprint 2)
- ✅ **Libro "Prompts que funcionan"** completo integrado:
  - Seed automático de 31 capítulos desde `/app/legacy/ebook/**/*.md`
    en 7 partes (Intro · P1 Fundamentos · P2 Niveles · P3 Destrezas
    · P4 Géneros · P5 Aplicaciones · Apéndices).
  - Nuevas páginas `/libro` (TOC con banner + descarga) y
    `/libro/:slug` (lector con sidebar desktop + drawer móvil +
    breadcrumb + Anterior/Siguiente).
  - **PDF descargable generado con WeasyPrint**: portada azul
    degradado con marca `[ | ]` y acento ámbar, índice paginado con
    `target-counter`, separadores por parte, tipografía Helvetica,
    ~150 páginas, 1.7 MB. Endpoint `GET /api/ebook.pdf`.
  - Acceso solo a estudiantes con enrollment activo+paid
    (admin bypass).
  - Link destacado "📘 Mi libro" en Dashboard.
- ✅ **Vídeos de YouTube por módulo**:
  - Campo `video_youtube_id` en `modules` editable desde admin
    (validación regex `^[A-Za-z0-9_-]{11}$` para evitar XSS).
  - Embed iframe con `?rel=0&modestbranding=1` arriba de la página
    del módulo cuando está definido.
- ✅ **Fix botón "Acceder"**: visible sin hover (fondo ámbar con
  `!important` para ganar especificidad).
- ✅ **Perfil + nombre/apellidos**:
  - Modelo `UserOut` extendido con `surname`.
  - `PUT /api/auth/profile` con validación.
  - Onboarding: tras magic-link, si falta nombre → redirección a
    `/mi-area/perfil?onboarding=1` con form pre-focused.
  - Dashboard saluda con `name` y muestra banner "Completa tu
    perfil" si incompleto.
  - Página `/mi-area/perfil` con datos personales editables + panel
    "Mi inscripción" (curso, fecha, importe, badge fundador, ref pago).
- ✅ **Bloqueo de tarea hasta leer materiales**:
  - `/api/course/{slug}/task/{id}` devuelve `module_resources`,
    `pending_resources`, `can_submit`.
  - `POST /submit` devuelve 400 con lista de materiales pendientes
    si quedan sin leer.
  - UI: banner rojo con lista clicable + textarea y botón
    deshabilitados ("Lee primero los materiales"); banner verde
    "✓ Has leído todos los materiales" cuando está listo.
  - Admin bypass.
- ✅ **Testing iter6**: backend 19/19 pytest + frontend 7/7 Playwright.

## Implementado en iteración 5 (2026-02 fork)
- ✅ **Check "Leído" + progreso** en materiales:
  - Auto-marcado idempotente al abrir cualquier recurso (estudiantes, no admins).
  - Sidebar y drawer muestran ✓ verde en cada material leído y un dot
    vacío en los no leídos; el contador "X / 17 leídos" con barra de
    progreso ámbar→verde.
  - Índice `/curso/:slug/recursos` muestra banner "Has leído X de Y
    materiales" + badge ✓ en cada card leído.
  - Backend: `user_progress` reutilizado con `resource_slug`; limpieza
    al borrar inscripción incluye los rows de recursos.
- ✅ **Navegación entre materiales** en `/recurso/:slug`:
  - Sidebar sticky en desktop con los 17 materiales agrupados por módulo.
  - Drawer deslizable en móvil con botón "📚 Índice de materiales".
  - Breadcrumb clicable: `Mis cursos › Curso › Módulo N › Título`.
  - Botones Anterior / Siguiente con título del recurso.
  - `/api/resource/{slug}` devuelve `course_slug`, `course_title`,
    `module_order`, `module_title`.
- ✅ **Fix visor Markdown**: `remark-gfm` + CSS overflow. Validado 5/5.
- ✅ **Fix generador PDF**: soporte fences + tablas GFM.

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

## Implementado en iteración 10 (2026-02 fork, sprint 5 · users + marketing)
- ✅ **Panel admin: Usuarios registrados**: nueva sección con tabla
  paginable que lista TODOS los usuarios (matriculados o no), búsqueda
  por email/nombre, contador de inscripciones, estado de marketing.
- ✅ **Borrado en cascada**: DELETE /api/admin/users/{id} elimina
  inscripciones, entregas, foros, progreso, certificados, pagos y magic
  links. Restaura plazas fundador. Bloqueado para admins y para uno mismo.
- ✅ **Email marketing masivo**: POST /api/admin/users/broadcast con
  target `all|enrolled|not_enrolled|selected`. Throttle 220ms para
  Resend (5 req/s). Excluye admins y usuarios con `marketing_consent=false`.
- ✅ **Baja RGPD pública**: GET /api/unsubscribe?token=… (JWT firmado)
  pone `marketing_consent=false` y muestra una página de confirmación.
  Cada email lleva el enlace en el footer.
- ✅ **Testing**: 16/16 backend pytest + smoke E2E frontend (search,
  selección, modal, envío real a 1 usuario). Regresión iter9: 12/12.

## Implementado en iteración 9 (2026-02 fork, sprint 5 · scheduled unlocks verified)
- ✅ **Desbloqueo automático programado de módulos (verificado)**: admin
  configura una fecha `unlock_at` desde el panel (date picker); APScheduler
  corre cada hora (`CronTrigger(minute=5)`) y ejecuta `run_module_auto_unlock`
  que desbloquea los módulos cuya fecha ya pasó.
- ✅ **UX hardening**: al auto-desbloquearse un módulo, el scheduler también
  limpia `unlock_at` (evita re-desbloqueo silencioso si el admin re-bloquea
  manualmente después).
- ✅ **Testing**: 12/12 backend pytest + 4/4 flujos frontend Playwright
  (iter 9). Tests cubren PATCH (date / ISO / empty / invalid), trigger
  manual `/admin/modules/auto-unlock/run`, pasado-desbloquea / futuro-no,
  403 para no-admin, regresión de `unlocked` toggle y `video_youtube_id`.

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
