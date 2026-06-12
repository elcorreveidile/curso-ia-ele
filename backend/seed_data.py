"""Database seeding: admin user, course, modules, lessons, tasks, resources, ebook chapters.

Called once on startup from server.py via on_startup.
"""
import hashlib
import re
from pathlib import Path

from core import ADMIN_EMAIL, db, log, new_id, now_utc

COURSE_IA_ELE = {
    "id": "course-ia-ele",
    "slug": "ia-ele",
    "title": "IA para la enseñanza de ELE",
    "description": (
        "Curso de formación docente · 2ª edición · Septiembre 2026 · 20 horas · 4 módulos · "
        "3 videotutorías en directo. Aprende a integrar herramientas de IA "
        "en tu práctica docente de ELE con criterio ético y pedagógico."
    ),
    "price_eur": 25000,  # 250 €
    "price_founder_eur": 14900,  # 149 €
    "is_founder_edition": True,
    "founder_seats": 20,
    "founder_seats_taken": 0,
    "active": True,
    "hours": 20,
    "start_date": "2026-09-16",
}


# Loaded at module load — keeps `MODULES_SEED` declarations clean below.
def _load_seed_text(filename: str) -> str:
    p = Path("/app/backend/seed_content") / filename
    if not p.exists():
        return ""
    return p.read_text(encoding="utf-8")


_GITHUB_GUIDE_FALLBACK_PLACEHOLDER = _load_seed_text("github_guide.md") or (
    "# Guía de inicio en GitHub\n\nEl contenido completo de esta guía se "
    "actualizará al desplegar la última versión."
)
_GITHUB_PAGES_GUIDE = """# Publica tu web del curso con GitHub Pages

Has llegado al final del curso 🎉 — y este es el momento de transformar todo
tu repositorio en una **web pública** que puedas enseñar a colegas, añadir a tu
CV o linkear desde tus redes.

## ¿Qué es GitHub Pages?

GitHub Pages es un servicio gratuito que convierte tu repositorio en una web
accesible desde una URL pública (`https://tu-usuario.github.io/curso-ia-ele`).
No necesitas hosting, dominio ni servidor — GitHub lo hace todo por ti.

## Pasos paso a paso

### 1. Asegúrate de tener un README.md decente

Tu archivo `README.md` será la **portada** de tu web. Si lo has cuidado
durante el curso, ya tienes la mitad del trabajo hecho. Si no, dedícale 10
minutos:

- Título del curso y tu nombre.
- Breve presentación profesional (2-3 líneas).
- Índice con enlaces a cada uno de tus módulos:
  ```markdown
  ## Mis trabajos del curso
  - [Módulo 1 · Ética y prompts](modulo-01.md)
  - [Módulo 2 · Mi asistente ELE](modulo-02.md)
  - [Módulo 3 · Plan MCER](modulo-03.md)
  - [Módulo 4 · Recursos multimodales](modulo-04.md)
  ```

### 2. Activa GitHub Pages

1. Ve a tu repo en `github.com/tu-usuario/curso-ia-ele`.
2. Haz clic en **Settings** (arriba a la derecha).
3. En el menú lateral izquierdo, busca y pulsa **Pages**.
4. En *"Source"*, despliega *"Branch"* y elige **`main`** (la rama principal).
5. Deja la carpeta como **`/ (root)`** y pulsa **Save**.

### 3. Espera 1-2 minutos

GitHub tarda un momento en construir tu web. Recarga la página de Settings →
Pages al cabo de un par de minutos: aparecerá un mensaje verde con la URL de tu
sitio:

> *Your site is live at https://tu-usuario.github.io/curso-ia-ele*

¡Pulsa la URL y compártela! 🎉

## ¿Y si quiero algo más bonito?

GitHub Pages soporta **temas** (themes) gratuitos. Para activar uno:

1. Vuelve a Settings → Pages.
2. En *"Theme chooser"* pulsa **Choose a theme**.
3. Elige el que más te guste (recomendados para portfolio educativo:
   *Cayman*, *Minimal*, *Slate*).
4. Pulsa **Select theme**. GitHub crea automáticamente un commit y tu web
   se actualiza con el nuevo diseño.

## Comparte tu web en el foro

Cuando tu web esté online, **pásate por el foro general del curso** y
comparte la URL. Vamos a hacer una lista de todas las webs creadas en el curso
para que podamos visitarnos y aprender unos de otros.

## ¿Qué hago después del curso?

- **Sigue añadiendo trabajos a tu repo** según los vayas haciendo en tu aula.
- Cada vez que actualices el README, GitHub Pages se reconstruye solo.
- Si quieres un dominio propio (`tu-nombre.com`), GitHub Pages lo permite —
  cuéntanos en el foro si necesitas ayuda.

## ¡Enhorabuena!

Has completado un curso intenso y te llevas un portfolio público que pocos
cursos te dan. Estoy muy orgulloso de tu trabajo.

— Javier
"""

MODULES_SEED = [
    {
        "order": 0,
        "title": "Empezar con GitHub",
        "description": (
            "Antes de los módulos del curso: configura tu cuenta de GitHub "
            "y crea el repositorio donde irás guardando todos tus trabajos. "
            "Al final del curso publicarás tu propia web con todo lo aprendido."
        ),
        "lessons": [
            {
                "title": "Por qué usamos GitHub",
                "content_md": (
                    "# Por qué empezamos con GitHub\n\n"
                    "**GitHub** será tu cuaderno digital durante el curso. En él irás "
                    "guardando todas las tareas que hagas, los prompts que te funcionen "
                    "y los recursos que prepares para tu aula.\n\n"
                    "**¿Qué te llevarás al final del curso?**\n\n"
                    "- Un **repositorio** con todo tu trabajo organizado.\n"
                    "- Una **web pública** (con GitHub Pages) que puedes compartir como "
                    "  portfolio profesional.\n"
                    "- La práctica de un flujo de trabajo que muchas instituciones "
                    "  educativas y editoriales usan a diario.\n\n"
                    "**No te preocupes si no eres técnico**: vamos paso a paso. Si te "
                    "atascas en algún punto, escribe en el foro general y te ayudamos."
                ),
            },
            {
                "title": "Guía completa: tu primer repositorio",
                "content_md": _GITHUB_GUIDE_FALLBACK_PLACEHOLDER,
            },
        ],
        "task": {
            "title": "Comparte tu repositorio en el foro",
            "instructions_md": (
                "1. Sigue la guía de la lección anterior y crea tu repo del curso.\n"
                "2. Ve a **Mi área → Mi perfil** y pega ahí la URL de tu repo de "
                "GitHub. Esa URL aparecerá automáticamente como referencia en cada "
                "entrega de los módulos siguientes.\n"
                "3. Pasa por el **foro general del curso** y preséntate brevemente "
                "compartiendo tu repo: qué materia/nivel impartes, qué te trae al "
                "curso, y un enlace a tu repo recién creado.\n\n"
                "*Esta tarea no se puntúa: es solo el punto de partida. Si tu URL ya "
                "está en tu perfil, ¡hecho!*"
            ),
            "due_days": 7,
        },
    },
    {
        "order": 1,
        "title": "Ética y prompts eficaces",
        "description": (
            "Reflexión crítica sobre el uso ético y responsable de la IA. "
            "Principios básicos de ingeniería de prompts aplicados a ELE."
        ),
        "lessons": [
            {"title": "Ética de la IA en educación", "content_md": "# Ética de la IA\n\nReflexión crítica sobre el uso responsable de la IA en el aula de ELE.\n\n- Sesgos algorítmicos\n- Equidad y accesibilidad\n- Protección de datos del alumnado"},
            {"title": "Principios de ingeniería de prompts", "content_md": "# Ingeniería de prompts\n\nEstructura, contexto y claridad para obtener respuestas útiles de la IA.\n\n- Rol + tarea + contexto + formato\n- Ejemplos few-shot\n- Iteración crítica"},
        ],
        "task": {
            "title": "Mi declaración de uso ético de la IA",
            "instructions_md": "Redacta en 300-500 palabras tu declaración personal de principios para el uso de IA en el aula de ELE. Incluye al menos tres compromisos concretos.",
            "due_days": 7,
        },
    },
    {
        "order": 2,
        "title": "Tu asistente de ELE: chatbots a tu medida",
        "description": (
            "Exploración de chatbots y sus posibilidades para ELE. "
            "Creación de asistentes educativos propios."
        ),
        "lessons": [
            {"title": "Panorama de chatbots para docentes", "content_md": "# Chatbots para docentes de ELE\n\n- ChatGPT, Claude, Gemini: diferencias\n- Casos de uso reales\n- Limitaciones"},
            {"title": "Cómo crear un mini asistente", "content_md": "# Tu primer asistente\n\nDiseño del system prompt y ejemplos."},
        ],
        "task": {
            "title": "Crea tu primer mini asistente ELE",
            "instructions_md": "Diseña el system prompt de un asistente para una necesidad concreta de tu aula. Prueba con 3 interacciones simuladas y valora críticamente las respuestas.",
            "due_days": 7,
        },
    },
    {
        "order": 3,
        "title": "Planifica con IA: clases alineadas con el MCER",
        "description": (
            "Prompts plantilla para el MCER. Diseño de secuencias didácticas "
            "y mini apps para generar planes de clase."
        ),
        "lessons": [
            {"title": "Descriptores MCER y prompts", "content_md": "# Prompts plantilla MCER\n\nAlineación con los descriptores del Marco Común Europeo."},
            {"title": "Diseño de secuencias didácticas con IA", "content_md": "# Secuencias didácticas\n\nDel objetivo de aprendizaje al plan de clase."},
        ],
        "task": {
            "title": "Genera y evalúa un plan de clase con IA",
            "instructions_md": "Genera con IA un plan de clase de 50 minutos para un nivel MCER concreto. Revísalo con criterios pedagógicos y adjunta la reflexión sobre la co-creación.",
            "due_days": 7,
        },
    },
    {
        "order": 4,
        "title": "Crea sin límites: recursos multimodales con IA gratuita",
        "description": (
            "Imágenes, audios y mapas mentales con herramientas de IA "
            "gratuitas para enriquecer tus clases."
        ),
        "lessons": [
            {"title": "Imagen y audio con IA", "content_md": "# Recursos multimodales\n\nHerramientas gratuitas para crear imágenes y audios educativos."},
            {"title": "Mapas mentales con IA", "content_md": "# Mapas mentales\n\nVisualiza vocabulario y estructuras."},
        ],
        "task": {
            "title": "Kit de recursos multimodales",
            "instructions_md": "Crea un kit completo (imagen + audio + mapa mental) para una unidad real que impartas. Añade una reflexión final en el foro.",
            "due_days": 7,
        },
    },
    {
        "order": 5,
        "title": "Cierre · Publica tu web del curso",
        "description": (
            "Convierte tu repositorio en una web pública con GitHub Pages. "
            "Te llevas un portfolio profesional que puedes compartir y "
            "ampliar después del curso."
        ),
        "lessons": [
            {
                "title": "Publica tu web con GitHub Pages",
                "content_md": _GITHUB_PAGES_GUIDE,
            },
        ],
        "task": {
            "title": "Comparte tu web en el foro general",
            "instructions_md": (
                "Cuando tu web esté online, comparte la URL en el **foro general "
                "del curso**. Vamos a celebrar el cierre con una lista de todas "
                "las webs creadas por la promoción.\n\n"
                "Pega en este formulario la URL de tu web (algo como "
                "`https://tu-usuario.github.io/curso-ia-ele`) y, opcionalmente, "
                "una breve reflexión sobre qué te llevas del curso."
            ),
            "due_days": 14,
        },
    },
]

# Resources mapping
RESOURCE_TYPES = {
    "lecturas": "lectura",
    "casos-reales": "lectura",
    "guias-comparativas": "lectura",
    "guias-herramientas": "lectura",
    "criterios-calidad": "lectura",
    "banco-mcer": "lectura",
    "tutoriales": "lectura",
    "plantillas": "plantilla",
    "rubricas": "rubrica",
    "glosarios": "glosario",
    "evaluacion": "encuesta",
}

RESOURCE_LABELS = {
    "lectura": "Lectura",
    "plantilla": "Plantilla",
    "rubrica": "Rúbrica",
    "glosario": "Glosario",
    "encuesta": "Encuesta",
}

MODULE_BY_FOLDER = {
    "modulo-01-etica": "mod-ia-01",
    "modulo-02-asistentes": "mod-ia-02",
    "modulo-03-planificacion": "mod-ia-03",
    "modulo-04-recursos": "mod-ia-04",
    "transversales": None,
}

SKIP_FOLDERS = {"videos", "propuesta"}
SKIP_FILES = {"GUIA_IMPLEMENTACION_MOODLE_COMPLETA.md", "GUIA_INICIO_MOODLE.md"}

# Ebook structure
EBOOK_PART_META = {
    "00": {"order": 0, "label": "Introducción"},
    "parte1": {"order": 1, "label": "Parte 1 · Fundamentos"},
    "parte2": {"order": 2, "label": "Parte 2 · Por niveles"},
    "parte3": {"order": 3, "label": "Parte 3 · Por destrezas"},
    "parte4": {"order": 4, "label": "Parte 4 · Por géneros textuales"},
    "parte5": {"order": 5, "label": "Parte 5 · Aplicaciones docentes"},
    "apendices": {"order": 6, "label": "Apéndices"},
}


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80] or "recurso"


async def seed_database() -> None:
    if not await db.users.find_one({"email": ADMIN_EMAIL.lower()}):
        await db.users.insert_one({
            "id": "admin-" + hashlib.md5(ADMIN_EMAIL.encode()).hexdigest()[:8],
            "email": ADMIN_EMAIL.lower(),
            "name": "Javier Benítez Láinez",
            "role": "admin",
            "created_at": now_utc(),
        })
        log.info("Seeded admin user: %s", ADMIN_EMAIL)

    course = await db.courses.find_one({"slug": "ia-ele"})
    if not course:
        await db.courses.insert_one({**COURSE_IA_ELE, "created_at": now_utc()})
        log.info("Seeded course ia-ele")

    # Seed any modules that don't yet exist (idempotent — supports adding
    # new modules later, e.g. Module 0 / Module 5 introduced after launch).
    for mdata in MODULES_SEED:
        mid = f"mod-ia-{mdata['order']:02d}"
        if await db.modules.find_one({"id": mid}):
            continue
        await db.modules.insert_one({
            "id": mid,
            "course_id": "course-ia-ele",
            "order": mdata["order"],
            "title": mdata["title"],
            "description": mdata["description"],
            # Modules 0, 1 and 5 are unlocked by default; the rest unlock
            # progressively (admin or scheduled) as the course advances.
            "unlocked_at": now_utc() if mdata["order"] in (0, 1, 5) else None,
            "created_at": now_utc(),
        })
        for lidx, lesson in enumerate(mdata["lessons"], start=1):
            await db.lessons.insert_one({
                "id": f"{mid}-l{lidx}",
                "module_id": mid,
                "order": lidx,
                "title": lesson["title"],
                "content_md": lesson["content_md"],
                "video_url": None,
                "visible": True,
                "created_at": now_utc(),
            })
        await db.tasks.insert_one({
            "id": f"{mid}-task",
            "module_id": mid,
            "order": 1,
            "title": mdata["task"]["title"],
            "instructions_md": mdata["task"]["instructions_md"],
            "due_days": mdata["task"]["due_days"],
            "created_at": now_utc(),
        })
        log.info("Seeded module %s · %s", mid, mdata["title"])


def _smart_case(s: str) -> str:
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return s
    if all(c.isupper() for c in letters):
        small = {"de", "del", "la", "el", "los", "las", "y", "o", "u", "con",
                 "para", "por", "en", "a", "al", "ele", "ia", "mcer"}
        words = s.lower().split()
        out = []
        for i, w in enumerate(words):
            core = w.strip(":·.,;!?")
            if i > 0 and core in small:
                out.append(w)
            else:
                out.append(w[:1].upper() + w[1:])
        res = " ".join(out)
        for ac in ("ELE", "IA", "MCER", "ChatGPT", "PDF", "A1", "A2", "B1", "B2", "C1", "C2"):
            res = re.sub(rf"\b{ac}\b", ac, res, flags=re.IGNORECASE)
        return res
    return s


async def seed_resources() -> None:
    base = Path("/app/legacy/materiales")
    if not base.exists():
        log.warning("No materials folder at %s, skipping resources seed", base)
        return
    count_new = 0
    count_updated = 0
    for md_file in base.rglob("*.md"):
        rel = md_file.relative_to(base)
        parts = rel.parts
        if any(p in SKIP_FOLDERS for p in parts):
            continue
        if md_file.name in SKIP_FILES:
            continue

        top_folder = parts[0]
        if top_folder not in MODULE_BY_FOLDER:
            continue
        module_id = MODULE_BY_FOLDER[top_folder]

        kind_folder = parts[1] if len(parts) > 2 else ""
        rtype = RESOURCE_TYPES.get(kind_folder, "lectura")

        content = md_file.read_text(encoding="utf-8", errors="ignore")
        title = None
        for m in re.finditer(r"^#\s+(.+)$", content, re.MULTILINE):
            candidate = m.group(1).strip()
            upper = candidate.upper().strip("·: .")
            if upper in {"ÍNDICE", "INDICE", "TABLA DE CONTENIDOS", "CONTENIDO", "TOC", "TABLE OF CONTENTS"}:
                continue
            title = candidate
            break
        if not title:
            title = md_file.stem.replace("_", " ").replace("-", " ").title()
        title = _smart_case(title)

        slug = slugify(md_file.stem)
        existing = await db.resources.find_one({"slug": slug})
        doc = {
            "slug": slug,
            "title": title,
            "type": rtype,
            "module_id": module_id,
            "course_id": "course-ia-ele",
            "content_md": content,
            "source_path": str(rel),
            "updated_at": now_utc(),
        }
        if existing:
            await db.resources.update_one({"slug": slug}, {"$set": doc})
            count_updated += 1
        else:
            doc.update({"id": new_id(), "created_at": now_utc()})
            await db.resources.insert_one(doc)
            count_new += 1
    log.info("Resources seeded: %d new, %d updated", count_new, count_updated)


def _ebook_title_from_md(md: str, fallback: str) -> str:
    for ln in md.splitlines():
        ln = ln.strip()
        if ln.startswith("# "):
            return ln[2:].strip()
        if ln.startswith("## "):
            return ln[3:].strip()
    return fallback


async def seed_ebook() -> None:
    base = Path("/app/legacy/ebook")
    if not base.exists():
        log.warning("No ebook folder at %s, skipping ebook seed", base)
        return
    new_count = 0
    upd_count = 0
    for md_path in sorted(base.rglob("*.md")):
        rel = md_path.relative_to(base)
        parts = rel.parts
        if parts[0] in ("00_INTRODUCCION.md",):
            part_key = "00"
            order_in_part = 0
        elif len(parts) == 2:
            part_key = parts[0]
            name = parts[1]
            order_in_part = int(name.split("_")[0]) if name[0].isdigit() else 0
        else:
            continue
        meta = EBOOK_PART_META.get(part_key)
        if not meta:
            continue
        content = md_path.read_text(encoding="utf-8")
        # Strip LaTeX-style `\newpage` markers (legacy Pandoc artifacts).
        content = re.sub(r"^\s*\\newpage\s*$", "", content, flags=re.MULTILINE)
        content = content.replace("\\newpage", "")
        default_title = md_path.stem.replace("_", " ").title()
        title = _ebook_title_from_md(content, default_title)
        slug = slugify(f"{part_key}-{md_path.stem}")
        doc = {
            "slug": slug,
            "part_key": part_key,
            "part_order": meta["order"],
            "part_label": meta["label"],
            "order_in_part": order_in_part,
            "title": title,
            "content_md": content,
            "source_path": str(rel),
            "updated_at": now_utc(),
        }
        existing = await db.ebook_chapters.find_one({"slug": slug})
        if existing:
            await db.ebook_chapters.update_one({"slug": slug}, {"$set": doc})
            upd_count += 1
        else:
            doc.update({"id": new_id(), "created_at": now_utc()})
            await db.ebook_chapters.insert_one(doc)
            new_count += 1
    log.info("Ebook seeded: %d new, %d updated", new_count, upd_count)



# ---------------------------------------------------------------------------
# Content migrations — run on every startup so that already-seeded lessons
# pick up text corrections from the source MD files. Each migration is
# idempotent: it only writes when the stored value differs from the source.
# ---------------------------------------------------------------------------

async def migrate_lesson_content() -> None:
    """Refresh hard-coded lesson content_md from the seed source files.

    Necessary because `seed_database()` is idempotent at the module level
    (it skips if the module already exists), so text fixes inside lessons
    never reach existing DB rows otherwise.
    """
    targets = [
        # (lesson_id, expected source content)
        ("mod-ia-00-l2", _GITHUB_GUIDE_FALLBACK_PLACEHOLDER),
    ]
    updated = 0
    for lesson_id, expected in targets:
        if not expected:
            continue
        existing = await db.lessons.find_one({"id": lesson_id}, {"content_md": 1})
        if existing and existing.get("content_md") != expected:
            await db.lessons.update_one(
                {"id": lesson_id},
                {"$set": {"content_md": expected, "updated_at": now_utc()}},
            )
            updated += 1
    if updated:
        log.info("Lesson content migration: %d lesson(s) refreshed", updated)

    # Course description + start_date: the 1st edition (May 2026) ended and
    # we're now advertising the 2nd edition (16 Sep 2026). Refresh stored
    # values so existing prod DBs (where seed_database() is a no-op for the
    # already-present course) pick up the new copy.
    expected_desc = COURSE_IA_ELE["description"]
    expected_start = COURSE_IA_ELE["start_date"]
    course_doc = await db.courses.find_one({"slug": "ia-ele"}, {"description": 1, "start_date": 1})
    if course_doc:
        updates = {}
        if course_doc.get("description") != expected_desc:
            updates["description"] = expected_desc
        if course_doc.get("start_date") != expected_start:
            updates["start_date"] = expected_start
        if updates:
            await db.courses.update_one({"slug": "ia-ele"}, {"$set": updates})
            log.info("Course refreshed for ia-ele: %s", list(updates.keys()))
