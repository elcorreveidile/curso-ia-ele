# Guía de Despliegue - Supabase + Stripe + Resend

Esta guía explica cómo configurar Supabase para el sistema de sesiones del curso gratuito.

## 📋 Índice

1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Creación de tablas](#2-creación-de-tablas)
3. [Configuración de variables de entorno](#3-configuración-de-variables-de-entorno)
4. [Despliegue de Edge Functions](#4-despliegue-de-edge-functions)
5. [Configuración de Stripe](#5-configuración-de-stripe)
6. [Configuración de Resend (opcional)](#6-configuración-de-resend-opcional)
7. [Testing](#7-testing)

---

## 1. Configuración de Supabase

### 1.1 Crear proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota estos datos:
   - Project URL
   - anon public key
   - service_role key (guardar de forma segura)

### 1.2 Configurar Database Webhooks (opcional)

Si quieres que Supabase notifique a tu backend cuando se creen registros:

1. En Supabase Dashboard → Database → Webhooks
2. Crea un nuevo webhook
3. Configura la URL de tu backend para recibir notificaciones

---

## 2. Creación de Tablas

### 2.1 Ejecutar script SQL

1. En Supabase Dashboard → SQL Editor
2. Abre el archivo `supabase/tables.sql`
3. Ejecuta todo el script

Esto creará:
- ✅ Tabla `individual_sessions`
- ✅ Tabla `group_sessions`
- ✅ Tabla `group_enrollments`
- ✅ Vista `group_sessions_with_count`
- ✅ Índices y políticas RLS
- ✅ Datos de ejemplo (una sesión grupal de prueba)

### 2.2 Verificar tablas

En Database → Tables deberías ver:
- `individual_sessions`
- `group_sessions`
- `group_enrollments`

---

## 3. Configuración de Variables de Entorno

### 3.1 En Supabase

Ve a: Settings → Edge Functions y añade:

```bash
STRIPE_SECRET_KEY=sk_live_xxx...  # o sk_test_xxx... para testing
STRIPE_WEBHOOK_SECRET=whsec_xxx... # (opcional) Obtener de Stripe
RESEND_API_KEY=re_xxx...           # Para enviar emails
```

### 3.2 En Frontend (React)

Crea/actualiza `.env` en la raíz del frontend:

```bash
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
```

**Importante**: Commit estos cambios en el repositorio.

---

## 4. Despliegue de Edge Functions

### 4.1 Instalar Supabase CLI

```bash
npm install -g supabase
# O
brew install supabase/tap/supabase
```

### 4.2 Login en Supabase

```bash
supabase login
```

### 4.3 Vincular proyecto

```bash
cd /Users/javierbenitez/Desktop/AI/Formación\ IA/curso-ia-ele
supabase link --project-ref YOUR_PROJECT_REF
```

El `YOUR_PROJECT_REF` es la parte del project URL antes de `.supabase.co`.

### 4.4 Desplegar Edge Functions

```bash
# Desplegar todas las funciones
supabase functions deploy

# O desplegar una específica
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### 4.5 Verificar despliegue

En Supabase Dashboard → Edge Functions deberías ver:
- ✅ `create-checkout`
- ✅ `stripe-webhook`

---

## 5. Configuración de Stripe

### 5.1 Crear productos y precios

En [Stripe Dashboard](https://dashboard.stripe.com):

#### Para sesiones individuales:
1. Products → Create product
   - Name: "Sesión Individual · IA y español"
   - Description: "60 minutos de acompañamiento personalizado"
2. Create price:
   - Amount: 4500 (45.00 €)
   - Currency: EUR

#### Para sesiones grupales:
1. Products → Create product
   - Name: "Sesión Grupal · IA y español"
   - Description: "60 minutos de sesión grupal (máximo 8 participantes)"
2. Create price:
   - Amount: 1500 (15.00 €)
   - Currency: EUR

**Nota**: Para producción, usa los Price IDs reales en el código. Para desarrollo, el código crea precios dinámicamente.

### 5.2 Configurar Webhook

1. En Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
   - Events: Selecciona `checkout.session.completed`
3. Copia el `Signing Secret` (whsec_...)
4. Añádelo a Supabase: `STRIPE_WEBHOOK_SECRET`

---

## 6. Configuración de Resend (Opcional)

### 6.1 Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu dominio de email

### 6.2 Obtener API Key

1. En Resend Dashboard → API Keys
2. Crea una nueva API key
3. Añádela a Supabase: `RESEND_API_KEY`

### 6.3 Configurar email de envío

Asegúrate de verificar el email que usarás para enviar:
- `benitezl@go.ugr.es`

---

## 7. Testing

### 7.1 Probar tablas

En Supabase Dashboard → Table Editor:

1. Ver `group_sessions` - debería haber 1 sesión de ejemplo
2. Ver `group_sessions_with_count` - debería mostrar el contador

### 7.2 Probar Edge Functions

```bash
# Test create-checkout (sesión individual)
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_type": "individual",
    "student_name": "Test Student",
    "student_email": "test@example.com",
    "date": "2026-05-15T16:00:00.000Z",
    "time": "16:00",
    "notes": "Test session"
  }'
```

Deberías recibir una respuesta con la URL de Stripe Checkout.

### 7.3 Probar flujo completo en frontend

1. Inicia el frontend: `npm start`
2. Navega a `http://localhost:3000/sesiones`
3. Prueba reservar sesión individual:
   - Selecciona fecha
   - Selecciona hora
   - Rellena formulario
   - Click en "Pagar"
4. Deberías redirigir a Stripe Checkout (test mode)
5. Completa el pago con tarjeta de prueba: `4242 4242 4242 4242`
6. Redirigirá a `/sesiones/confirmada`
7. Verifica en Supabase Dashboard → `individual_sessions` que se creó el registro

---

## 📝 Checklist

- [ ] Proyecto Supabase creado
- [ ] Tablas SQL ejecutadas
- [ ] Variables de entorno configuradas en Supabase
- [ ] Variables de entorno configuradas en frontend (.env)
- [ ] Edge Functions desplegadas
- [ ] Stripe products/prices creados
- [ ] Stripe webhook configurado
- [ ] Resend API key configurada (opcional)
- [ ] Flujo de pago individual probado
- [ ] Flujo de pago grupal probado

---

## 🆘 Troubleshooting

### Error: "Invalid signature" en webhook
- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- En desarrollo, puedes omitir esta verificación dejando la variable vacía

### Error: "No se recibió URL de checkout"
- Verifica que la Edge Function `create-checkout` esté desplegada
- Revisa los logs en Supabase Dashboard → Edge Functions

### Error: "CORS policy blocked"
- Verifica que los headers CORS estén correctos en las Edge Functions
- Debería incluir `Access-Control-Allow-Origin: *`

---

## 📚 Recursos

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Resend Email API Docs](https://resend.com/docs/api-reference/email/send)
