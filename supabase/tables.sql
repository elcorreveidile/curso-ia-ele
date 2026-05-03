-- ============================================
-- CURSO GRATUITO + SISTEMA DE SESIONES
-- Scripts SQL para Supabase
-- ============================================

-- 0. TABLA: Inscripciones al curso gratuito
-- ============================================
CREATE TABLE IF NOT EXISTS free_course_enrollments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name     text NOT NULL,
  student_email    text NOT NULL UNIQUE,
  enrolled_at      timestamptz DEFAULT now(),
  last_accessed    timestamptz,
  current_module   text DEFAULT 'intro',
  modules_completed text[] DEFAULT '{}',
  utm_source       text,
  utm_medium       text,
  utm_campaign     text
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_free_enrollments_email ON free_course_enrollments(student_email);
CREATE INDEX IF NOT EXISTS idx_free_enrollments_enrolled ON free_course_enrollments(enrolled_at);

-- Comentario
COMMENT ON TABLE free_course_enrollments IS 'Inscripciones al curso gratuito "IA y español" para estudiantes';

-- 1. TABLA: Sesiones individuales
-- ============================================
CREATE TABLE IF NOT EXISTS individual_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name  text NOT NULL,
  student_email text NOT NULL,
  date          date NOT NULL,
  time          time NOT NULL,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  stripe_payment_id text,
  amount_paid   integer DEFAULT 4500,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_individual_sessions_date ON individual_sessions(date);
CREATE INDEX IF NOT EXISTS idx_individual_sessions_status ON individual_sessions(status);
CREATE INDEX IF NOT EXISTS idx_individual_sessions_stripe ON individual_sessions(stripe_payment_id);

-- Comentario de tabla
COMMENT ON TABLE individual_sessions IS 'Sesiones individuales de 60 minutos para estudiantes de español';

-- 2. TABLA: Sesiones grupales
-- ============================================
CREATE TABLE IF NOT EXISTS group_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  date          timestamptz NOT NULL,
  duration_min  integer DEFAULT 60,
  price_cents   integer DEFAULT 1500,
  min_students  integer DEFAULT 4,
  max_students  integer DEFAULT 8,
  status        text DEFAULT 'open' CHECK (status IN ('open', 'confirmed', 'cancelled')),
  zoom_link     text,
  created_at    timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_group_sessions_date ON group_sessions(date);
CREATE INDEX IF NOT EXISTS idx_group_sessions_status ON group_sessions(status);

-- Comentario
COMMENT ON TABLE group_sessions IS 'Sesiones grupales de 60 minutos (máximo 8 participantes, mínimo 4)';

-- 3. TABLA: Inscripciones a sesiones grupales
-- ============================================
CREATE TABLE IF NOT EXISTS group_enrollments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid REFERENCES group_sessions(id) ON DELETE CASCADE,
  student_name     text NOT NULL,
  student_email    text NOT NULL,
  stripe_payment_id text,
  refunded         boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_group_enrollments_session ON group_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_group_enrollments_stripe ON group_enrollments(stripe_payment_id);

-- Comentario
COMMENT ON TABLE group_enrollments IS 'Inscripciones de estudiantes a sesiones grupales';

-- 4. VISTA: Sesiones grupales con contador
-- ============================================
CREATE OR REPLACE VIEW group_sessions_with_count AS
SELECT
  gs.*,
  COUNT(ge.id) AS enrolled_count,
  gs.max_students - COUNT(ge.id) AS spots_remaining
FROM group_sessions gs
LEFT JOIN group_enrollments ge ON ge.session_id = gs.id
GROUP BY gs.id;

-- Comentario
COMMENT ON VIEW group_sessions_with_count IS 'Vista de sesiones grupales con contador de inscritos y plazas disponibles';

-- 5. POLÍTICAS DE SEGURIDAD (RLS) - Opcional pero recomendado
-- ============================================

-- Habilitar RLS
ALTER TABLE individual_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_enrollments ENABLE ROW LEVEL SECURITY;

-- Políticas para individual_sessions
-- Permitir a anyone leer (para confirmaciones)
CREATE POLICY "Allow read access to individual_sessions"
  ON individual_sessions FOR SELECT
  TO anon
  USING (true);

-- Permitir insert (vía webhook)
CREATE POLICY "Allow insert to individual_sessions"
  ON individual_sessions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Políticas para group_sessions
CREATE POLICY "Allow read access to group_sessions"
  ON group_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow all access to group_sessions for service_role"
  ON group_sessions FOR ALL
  TO service_role
  USING (true);

-- Políticas para group_enrollments
CREATE POLICY "Allow read access to group_enrollments"
  ON group_enrollments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert to group_enrollments"
  ON group_enrollments FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 6. DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar una sesión grupal de ejemplo para testing
INSERT INTO group_sessions (title, description, date, duration_min, price_cents, min_students, max_students, status)
VALUES (
  'Conversación para nivel B1: Hablar de viajes',
  'Sesión grupal para practicar vocabulario y expresiones relacionadas con viajes. Trae tus preguntas y experiencias para compartir.',
  NOW() + INTERVAL '7 days',
  60,
  1500,
  4,
  8,
  'open'
) ON CONFLICT DO NOTHING;

-- 7. FUNCIONES ÚTILES (Opcional)
-- ============================================

-- Función para verificar disponibilidad de hora
CREATE OR REPLACE FUNCTION check_time_availability(
  p_date date,
  p_time time,
  p_max_sessions integer DEFAULT 3
) RETURNS boolean AS $$
DECLARE
  session_count integer;
BEGIN
  SELECT COUNT(*) INTO session_count
  FROM individual_sessions
  WHERE date = p_date
    AND time = p_time
    AND status IN ('pending', 'confirmed');

  RETURN session_count < p_max_sessions;
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION check_time_availability IS 'Verifica si hay disponibilidad para una fecha y hora específicas';

-- Función para contar inscritos en sesión grupal
CREATE OR REPLACE FUNCTION get_enrollment_count(p_session_id uuid)
RETURNS integer AS $$
DECLARE
  enrollment_count integer;
BEGIN
  SELECT COUNT(*) INTO enrollment_count
  FROM group_enrollments
  WHERE session_id = p_session_id;

  RETURN enrollment_count;
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION get_enrollment_count IS 'Cuenta el número de inscritos en una sesión grupal';
