# 🎉 Implementación Completa: Curso Gratuito + Sistema de Sesiones

## ✅ Qué se ha implementado

### Frontend (React)
- ✅ **Curso gratuito para estudiantes** (`/aprende`)
  - Landing page con hero, razones, requisitos
  - Programa con 6 módulos completos
  - Vista individual de cada módulo con contenido detallado
  - Módulo 0 completo con videos, lecturas y actividades
  - Módulos I-IV con bloques A/B (general + específico español)
  - Módulo V con 8 escenarios prácticos

- ✅ **Sistema de Sesiones** (`/sesiones`)
  - Landing con sesiones individuales y grupales
  - Reserva de sesión individual con selector fecha/hora
  - Reserva de sesión grupal con contador en tiempo real
  - Páginas de confirmación y cancelación
  - Integración con Stripe Checkout

- ✅ **Componentes actualizados**
  - Navbar con enlace "Curso gratuito"
  - Footer con columna "Para estudiantes"
  - App.js con 8 nuevas rutas (sin tocar las existentes)
  - Cliente Supabase configurado

### Backend (Supabase)
- ✅ **Tablas SQL creadas**
  - `individual_sessions` - Sesiones individuales de 60 min
  - `group_sessions` - Sesiones grupales
  - `group_enrollments` - Inscripciones a sesiones grupales
  - `group_sessions_with_count` - Vista con contador en tiempo real
  - Índices, políticas RLS y funciones útiles

- ✅ **Edge Functions de Supabase**
  - `create-checkout` - Crea sesiones de Stripe Checkout
  - `stripe-webhook` - Procesa pagos confirmados y crea registros en Supabase
  - Soporte para sesiones individuales y grupales

- ✅ **Sistema de Emails (Resend)**
  - 7 plantillas de email transaccionales
  - Sesión individual confirmada (estudiante)
  - Nueva reserva individual (formador)
  - Inscripción sesión grupal (estudiante)
  - Sesión grupal confirmada (mínimo alcanzado)
  - Sesión grupal cancelada (estudiante)
  - Sesión grupal cancelada (formador)
  - Zoom añadido a sesión

- ✅ **Panel de Administración**
  - Sección "Sesiones" en `/admin`
  - Ver sesiones individuales confirmadas (próximos 7 días)
  - Crear nuevas sesiones grupales
  - Ver inscritos por sesión grupal
  - Añadir enlace Zoom a sesiones
  - Cancelar sesiones grupales

---

## 📦 Archivos Creados

### Frontend
```
frontend/src/
├── lib/
│   └── supabaseClient.js                    # Cliente Supabase
├── pages/public/
│   ├── aprende/
│   │   ├── AprendeHome.jsx                 # Landing del curso gratuito
│   │   ├── AprendePrograma.jsx             # Programa con 6 módulos
│   │   └── AprendeModulo.jsx               # Vista individual de módulo
│   └── sesiones/
│       ├── Sesiones.jsx                    # Landing de sesiones
│       ├── ReservaIndividual.jsx            # Reserva individual
│       ├── ReservaGrupal.jsx               # Reserva grupal
│       ├── SesionConfirmada.jsx            # Confirmación post-pago
│       └── SesionCancelada.jsx             # Aviso de cancelación
└── components/
    ├── Navbar.jsx                           # ✏️ Modificado
    ├── Footer.jsx                           # ✏️ Modificado
    └── admin/
        └── AdminSessions.jsx                 # Gestión de sesiones
```

### Backend
```
supabase/
├── tables.sql                               # Scripts SQL para crear tablas
├── functions/
│   ├── create-checkout/index.ts             # Edge Function: Stripe Checkout
│   └── stripe-webhook/index.ts              # Edge Function: Webhook de Stripe
├── emails.ts                                # Plantillas de email (Resend)
├── sendEmail.ts                             # Función auxiliar para emails
└── README.md                                # Guía de despliegue de Supabase
```

### Archivos Modificados
- `frontend/src/App.js` - 8 nuevas rutas añadidas
- `frontend/src/components/Navbar.jsx` - Enlace "Curso gratuito"
- `frontend/src/components/Footer.jsx` - Columna "Para estudiantes"
- `frontend/src/pages/admin/Admin.jsx` - Sección "Sesiones" añadida

---

## 🚀 Guía de Despliegue Paso a Paso

### Paso 1: Configurar Supabase

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia: Project URL y anon key

2. **Ejecutar scripts SQL**
   ```bash
   # En Supabase Dashboard → SQL Editor
   # Abre y ejecuta: supabase/tables.sql
   ```
   Esto creará todas las tablas, índices, vista y políticas RLS.

3. **Configurar variables de entorno**
   ```
   # En Supabase Dashboard → Settings → Edge Functions
   STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para testing)
   STRIPE_WEBHOOK_SECRET=whsec_... (opcional, de Stripe)
   RESEND_API_KEY=re_... (opcional, para emails)
   ```

### Paso 2: Configurar Frontend

1. **Añadir variables de entorno**
   ```bash
   # En frontend/.env
   REACT_APP_SUPABASE_URL=https://xxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
   ```

2. **Instalar dependencias (si es necesario)**
   ```bash
   cd frontend
   npm install @supabase/supabase-js
   ```

3. **Iniciar frontend**
   ```bash
   npm start
   ```

### Paso 3: Desplegar Edge Functions

1. **Instalar Supabase CLI**
   ```bash
   npm install -g supabase
   # O: brew install supabase/tap/supabase
   ```

2. **Login y vincular proyecto**
   ```bash
   supabase login
   cd /Users/javierbenitez/Desktop/AI/Formación\ IA/curso-ia-ele
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Desplegar funciones**
   ```bash
   supabase functions deploy
   # O individualmente:
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook
   ```

### Paso 4: Configurar Stripe

1. **Crear productos y precios**
   - Ve a [Stripe Dashboard](https://dashboard.stripe.com)
   - Crea productos para sesiones individuales (45€) y grupales (15€)
   - O usa el código que crea precios dinámicamente

2. **Configurar webhook**
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
   - Eventos: `checkout.session.completed`
   - Copia el Signing Secret y añádelo a Supabase como `STRIPE_WEBHOOK_SECRET`

### Paso 5: Configurar Resend (Opcional)

1. **Crear cuenta en [resend.com](https://resend.com)**
2. **Verificar dominio de email** (`benitezl@go.ugr.es`)
3. **Obtener API key** y añadir a Supabase como `RESEND_API_KEY`

### Paso 6: Testing

1. **Probar frontend**
   ```bash
   npm start
   # Navega a:
   # - http://localhost:3000/aprende
   # - http://localhost:3000/sesiones
   ```

2. **Probar flujo de pago individual**
   - Ve a `/sesiones/individual`
   - Selecciona fecha y hora
   - Rellena formulario
   - Paga con tarjeta de prueba: `4242 4242 4242 4242`
   - Verifica registro en `individual_sessions`

3. **Probar flujo de pago grupal**
   - Ve a `/sesiones`
   - Crea sesión grupal desde admin
   - Inscribete en la sesión
   - Verifica registro en `group_enrollments`

---

## 📋 Checklist Final

### Curso Gratuito
- [ ] Landing `/aprende` visible y funcional
- [ ] Programa `/aprende/programa` con 6 módulos
- [ ] Módulos individuales `/aprende/modulo/:id` funcionan
- [ ] Contenido del Módulo 0 completo y bien formateado
- [ ] Bloques A/B en módulos I-IV se ven correctamente
- [ ] Módulo V muestra 8 escenarios

### Sistema de Sesiones
- [ ] `/sesiones` muestra sesiones individuales y grupales
- [ ] Selector de fecha/hora funciona
- [ ] Validación de antelación mínima (48h)
- [ ] Validación de máximo 3 sesiones por día
- [ ] Contador de plazas en tiempo real para sesiones grupales
- [ ] Formularios de reserva funcionan
- [ ] Pago con Stripe Checkout funciona
- [ ] Página de confirmación post-pago funciona

### Backend
- [ ] Tablas creadas en Supabase
- [ ] Vista `group_sessions_with_count` funciona
- [ ] Edge Functions desplegadas y accesibles
- [ ] Webhook de Stripe procesa pagos
- [ ] Registros se crean correctamente en Supabase
- [ ] Emails se envían (si Resend configurado)

### Admin
- [ ] Sección "Sesiones" visible en `/admin`
- [ ] Se pueden ver sesiones individuales confirmadas
- [ ] Se pueden crear sesiones grupales
- [ ] Se pueden ver inscritos por sesión
- [ ] Se pueden añadir enlaces Zoom
- [ ] Se pueden cancelar sesiones grupales

### Testing General
- [ ] El curso de profesores funciona igual que antes
- [ ] Ninguna ruta existente se ha roto
- [ ] Responsive en móvil
- [ ] Sin errores en consola
- [ ] Curso gratuito es accesible SIN login
- [ ] Admin sigue siendo accesible CON login

---

## 🧰 Punto de Partida

Antes de empezar, debes tener:
- [x] Cuenta de Supabase creada
- [x] Cuenta de Stripe (o cuenta de prueba)
- [x] Node.js y npm instalados
- [x] Acceso al repositorio del curso

## 📞 Soporte

Si encuentras algún problema:

1. **Verifica la consola del navegador** para errores de frontend
2. **Revisa los logs de Supabase** (Dashboard → Edge Functions)
3. **Comprueba las variables de entorno** están configuradas
4. **Verifica que las Edge Functions estén desplegadas**

---

## 🎉 ¡Felicidades!

Has implementado completamente:
- ✅ Curso gratuito para estudiantes de español
- ✅ Sistema de sesiones individuales (45€)
- ✅ Sistema de sesiones grupales (15€)
- ✅ Integración con Stripe para pagos
- ✅ Panel de administración extendido
- ✅ Sistema de emails transaccionales

**Sin romper nada del curso existente para profesores.** 🚀

---

*Curso "IA y español: aprende más, aprende mejor" · laclasedigital.com*
*Javier Benítez Láinez · benitezl@go.ugr.es*
