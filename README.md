# [|] La Clase Digital — IA para la enseñanza de ELE

Plataforma de formación docente en Inteligencia Artificial para profesores de **Español como Lengua Extranjera**. Desarrollada por [Javier Benítez Láinez](https://laclasedigital.com) · Centro de Lenguas Modernas · Universidad de Granada.

🌐 **[laclasedigital.com](https://laclasedigital.com)**

---

## Sobre el curso

**IA para la enseñanza de ELE: planificación de clases y creación de materiales** es un curso de formación docente de 20 horas diseñado para profesores de español que quieren integrar la inteligencia artificial en su práctica con criterio pedagógico, ético y metodológico.

- 📅 Primera edición: mayo 2026
- 👥 20 plazas · Grupos reducidos
- 💶 149 € (precio fundador) · 249 € (precio general)
- 🏅 Certificado de aprovechamiento de 20 horas

### Módulos

| Módulo | Contenido |
|--------|-----------|
| **I** | Ética de la IA y prompts eficaces · Marco FRAME |
| **II** | Tu asistente de ELE: chatbots a tu medida |
| **III** | Planifica con IA: clases alineadas con el MCER |
| **IV** | Crea sin límites: recursos multimodales con IA gratuita |

---

## Stack técnico

### Frontend
- **React** (Create React App + craco)
- **Tailwind CSS**
- **React Router v6**
- **react-markdown** + remark-gfm
- **@react-pdf/renderer** — generación de certificados en PDF

### Backend
- **FastAPI** (Python)
- **MongoDB** (Motor — cliente async)
- **Stripe** — pagos y webhooks (vía `emergentintegrations`)
- **Resend** — emails transaccionales
- **Cloudinary** — almacenamiento de archivos subidos
- **APScheduler** — tareas programadas
- **WeasyPrint / ReportLab** — generación de PDFs en servidor
- **JWT** + magic links — autenticación sin contraseña

### Despliegue
- Frontend: **Vercel**
- Backend: servidor propio
- Dominio: **laclasedigital.com**

---

## Estructura del repositorio

```
curso-ia-ele/
│
├── frontend/                  # React app
│   ├── src/
│   │   ├── components/        # Navbar, Footer, PageHero...
│   │   ├── pages/
│   │   │   ├── public/        # Home, Descripcion, Programa, Precios...
│   │   │   ├── private/       # Dashboard, módulos, tareas
│   │   │   └── admin/         # Panel de administración
│   │   └── lib/               # Hooks y utilidades
│   └── public/                # Favicons, imágenes estáticas
│
├── backend/                   # FastAPI app
│   ├── server.py              # Entrada principal · rutas
│   ├── core.py                # Config, DB, auth, email
│   ├── models.py              # Esquemas Pydantic
│   ├── scheduler.py           # Tareas programadas
│   ├── routes/                # Rutas extraídas
│   ├── seed_content/          # Contenidos iniciales (guías, PDFs)
│   └── tests/                 # Tests del backend
│
├── legacy/                    # Materiales del curso (Markdown)
│   └── materiales/
│       ├── modulo-01-etica/
│       ├── modulo-02-asistentes/
│       ├── modulo-03-planificacion/
│       ├── modulo-04-recursos/
│       └── transversales/     # Glosarios, guías, evaluación
│
├── futuros-cursos/            # Desarrollo de próximos cursos
└── memory/                    # Memoria del proyecto
```

---

## Instalación y desarrollo local

### Requisitos previos
- Node.js 18+
- Python 3.11+
- MongoDB
- Cuentas en: Stripe · Resend · Cloudinary

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Configura las variables de entorno
uvicorn server:app --reload
```

### Variables de entorno necesarias (backend)

```
MONGO_URL=
JWT_SECRET=
MAGIC_LINK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_ORIGIN=
ADMIN_EMAIL=
```

---

## Autenticación

El sistema usa **magic links** — sin contraseñas. El usuario introduce su correo, recibe un enlace por email y accede directamente. Los tokens se validan con JWT.

---

## Materiales del curso

Los materiales didácticos en formato Markdown están en `legacy/materiales/`. Incluyen:

- Lecturas y textos de referencia por módulo
- Guiones de vídeo
- Rúbricas de evaluación
- Plantillas de system prompts (A1–C2)
- Banco de descriptores MCER
- Glosario de términos de IA para ELE
- Guía de inicio en GitHub para participantes

---

## Identidad del proyecto

El símbolo **`[|]`** es la marca personal del autor: representa el cursor de texto, el separador editorial, el operador lógico *or* y el conector entre mundos. Aparece en el logo, el favicon y todos los materiales del proyecto.

---

## Licencia y autoría

Desarrollado por **Javier Benítez Láinez**
Docente de ELE · Diploma Digitalización Aplicada al Sector Productivo · Formador de Formadores (Instituto Cervantes)
📧 benitezl@go.ugr.es · 🌐 laclasedigital.com

Los materiales didácticos del curso son de elaboración propia.
El marco de las 4D está basado en **AI Fluency for Students** (Dakan, Feller & Anthropic · CC BY-NC-SA 4.0).
El marco **FRAME** de ingeniería de prompts para ELE es de elaboración propia.

---

*Centro de Lenguas Modernas · Universidad de Granada · 2026*
