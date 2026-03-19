# IA para la enseñanza de ELE · Web del curso

## Estructura del proyecto

```
curso-ia-ele/
├── index.html          ← Página principal (todo en una sola página)
├── css/
│   └── style.css       ← Estilos completos
├── js/
│   └── main.js         ← Lógica de navegación y envío del cuestionario
└── README.md           ← Este archivo
```

## Pasos para publicar en GitHub Pages

1. Crea un repositorio en GitHub (ej. `curso-ia-ele`)
2. Sube todos los archivos manteniendo la estructura de carpetas
3. Ve a **Settings → Pages → Source**: selecciona `main` y `/root`
4. Tu web estará en `https://TU_USUARIO.github.io/curso-ia-ele/`

## Activar el formulario con Formspree

El cuestionario envía los datos a tu correo vía Formspree (gratuito, sin servidor):

1. Ve a https://formspree.io y crea una cuenta gratuita
2. Crea un nuevo formulario → pon el correo `benitezl@go.ugr.es`
3. Copia el **Form ID** que te dan (tiene este aspecto: `xyzabcde`)
4. En `index.html`, busca esta línea:
   ```html
   <form id="diagnosticoForm" action="https://formspree.io/f/YOUR_FORM_ID"
   ```
   y sustituye `YOUR_FORM_ID` por tu ID real:
   ```html
   <form id="diagnosticoForm" action="https://formspree.io/f/xyzabcde"
   ```
5. Guarda, sube a GitHub. ¡Listo! Cada envío llegará a tu correo.

**Límite gratuito:** 50 envíos/mes. Para un curso con más participantes, el plan Plus (10 €/mes) ofrece envíos ilimitados.

## Instrucciones para Claude Code (Codex)

Para llevar este proyecto a Claude Code en tu terminal:

```bash
# 1. Clona o crea el repo
git init curso-ia-ele
cd curso-ia-ele

# 2. Copia los archivos del proyecto aquí

# 3. Instala Claude Code si no lo tienes
npm install -g @anthropic-ai/claude-code

# 4. Lanza Claude Code dentro del proyecto
claude

# 5. Ejemplo de instrucciones para Claude Code:
# "Añade una sección de preguntas frecuentes al final de index.html"
# "Cambia la paleta de colores a verde y blanco"
# "Añade validación de campos obligatorios al formulario"
# "Traduce toda la web al inglés"
```

## Personalización rápida

- **Fechas del curso**: busca `abril 2026` en `index.html` y cambia por las definitivas
- **Colores**: edita las variables CSS en la raíz de `style.css` (`:root { ... }`)
- **Logo/nombre**: busca `IA<span>ELE</span>` en el nav y personaliza
- **Correo de destino**: solo necesitas cambiarlo en Formspree (no en el código)
