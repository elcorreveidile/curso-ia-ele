// Plantillas de Email - Resend
// Sistema de sesiones del curso gratuito

interface EmailContext {
  studentName: string;
  studentEmail: string;
  formadorEmail: string;
}

// ============================================
// 1. SESIÓN INDIVIDUAL CONFIRMADA
// ============================================
export const individualSessionConfirmedTemplate = (
  context: EmailContext & {
    date: string;
    time: string;
    amount: number;
  }
) => ({
  to: context.studentEmail,
  subject: `Tu sesión con Javier · ${new Date(context.date).toLocaleDateString('es-ES')} ${context.time}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: linear-gradient(135deg, #0A1628, #0F2744); padding: 2rem; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: #F5A623; margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .details p { margin: 0.5rem 0; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.85rem; color: #6B82A0; }
        .cta { display: inline-block; background: #F5A623; color: #1A2535; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Sesión Confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola ${context.studentName},</p>
          <p>Tu sesión individual ha sido confirmada. Aquí tienes los detalles:</p>

          <div class="details">
            <p><strong>📅 Fecha:</strong> ${new Date(context.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>⏰ Hora:</strong> ${context.time} h</p>
            <p><strong>💳 Pagado:</strong> ${(context.amount / 100).toFixed(0)} €</p>
          </div>

          <p>Recibirás el enlace de conexión (Zoom) por email antes de la sesión.</p>

          <p>Si tienes alguna pregunta, no dudes en responder a este email.</p>

          <div style="text-align: center;">
            <a href="https://laclasedigital.com/aprende" class="cta">Continuar con el curso gratuito →</a>
          </div>

          <div class="footer">
            <p>IA y español: aprende más, aprende mejor</p>
            <p>laclasedigital.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 2. NUEVA RESERVA INDIVIDUAL (FORMADOR)
// ============================================
export const individualSessionFormadorTemplate = (
  context: EmailContext & {
    date: string;
    time: string;
    notes?: string;
  }
) => ({
  to: context.formadorEmail,
  subject: `Nueva reserva · ${context.studentName} · ${new Date(context.date).toLocaleDateString('es-ES')}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: #0F4C81; color: white; padding: 2rem; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #F5A623; }
        .details p { margin: 0.5rem 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Nueva Reserva de Sesión Individual</h1>
        </div>
        <div class="content">
          <p>Tienes una nueva reserva de sesión individual:</p>

          <div class="details">
            <p><strong>Estudiante:</strong> ${context.studentName}</p>
            <p><strong>Email:</strong> ${context.studentEmail}</p>
            <p><strong>Fecha:</strong> ${new Date(context.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Hora:</strong> ${context.time} h</p>
            ${context.notes ? `<p><strong>Notas:</strong> ${context.notes}</p>` : ''}
          </div>

          <p>Recuerda enviar el enlace de Zoom al estudiante antes de la sesión.</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 3. INSCRIPCIÓN SESIÓN GRUPAL
// ============================================
export const groupEnrollmentConfirmedTemplate = (
  context: EmailContext & {
    sessionTitle: string;
    sessionDate: string;
    enrolledCount: number;
    minStudents: number;
    amount: number;
  }
) => ({
  to: context.studentEmail,
  subject: `Te has apuntado · ${context.sessionTitle}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: linear-gradient(135deg, #0A1628, #0F2744); padding: 2rem; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: #F5A623; margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .details p { margin: 0.5rem 0; }
        .warning { background: #FEF3DC; border-left: 4px solid #F5A623; padding: 1rem; border-radius: 6px; margin: 1.5rem 0; font-size: 0.9rem; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.85rem; color: #6B82A0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Inscripción Confirmada</h1>
        </div>
        <div class="content">
          <p>Hola ${context.studentName},</p>
          <p>Te has inscrito correctamente en la sesión grupal:</p>

          <div class="details">
            <p><strong>Sesión:</strong> ${context.sessionTitle}</p>
            <p><strong>📅 Fecha y hora:</strong> ${new Date(context.sessionDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${new Date(context.sessionDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h</p>
            <p><strong>👥 Inscritos:</strong> ${context.enrolledCount} / mínimo necesario: ${context.minStudents}</p>
            <p><strong>💳 Pagado:</strong> ${(context.amount / 100).toFixed(0)} €</p>
          </div>

          <div class="warning">
            <p><strong>Importante:</strong> Esta sesión necesita mínimo ${context.minStudents} participantes. Si no se alcanza el mínimo 48h antes, se cancelará y recibirás la devolución automáticamente.</p>
          </div>

          <p>Cuando la sesión se confirme, recibirás el enlace de Zoom por email.</p>

          <div class="footer">
            <p>IA y español: aprende más, aprende mejor</p>
            <p>laclasedigital.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 4. SESIÓN GRUPAL CONFIRMADA (MÍNIMO ALCANZADO)
// ============================================
export const groupSessionConfirmedTemplate = (
  context: EmailContext & {
    sessionTitle: string;
    sessionDate: string;
    zoomLink: string;
  }
) => ({
  to: context.studentEmail,
  subject: `¡Sesión Confirmada! · ${context.sessionTitle}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: #1A7A52; color: white; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .cta { display: block; background: #1A7A52; color: white; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; margin: 1.5rem 0; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.85rem; color: #6B82A0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Sesión Confirmada!</h1>
        </div>
        <div class="content">
          <p>Buenas noticias, ${context.studentName}:</p>
          <p>La sesión grupal "<strong>${context.sessionTitle}</strong>" ha alcanzado el mínimo de participantes y está confirmada.</p>

          <div class="details">
            <p><strong>📅 Fecha y hora:</strong> ${new Date(context.sessionDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${new Date(context.sessionDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h</p>
          </div>

          <p><strong>🔗 Enlace de conexión:</strong></p>
          <a href="${context.zoomLink}" class="cta">Unirse a la sesión en Zoom →</a>

          <p>Prepara tu repositorio GitHub con las actividades del curso para sacar el máximo provecho a la sesión.</p>

          <div class="footer">
            <p>IA y español: aprende más, aprende mejor</p>
            <p>laclasedigital.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 5. SESIÓN GRUPAL CANCELADA (ESTUDIANTE)
// ============================================
export const groupSessionCancelledTemplate = (
  context: EmailContext & {
    sessionTitle: string;
    sessionDate: string;
    refundAmount: number;
  }
) => ({
  to: context.studentEmail,
  subject: `Sesión cancelada · devolución en camino`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: #F5A623; color: #1A2535; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #F5A623; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.85rem; color: #6B82A0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Sesión Cancelada</h1>
        </div>
        <div class="content">
          <p>Hola ${context.studentName},</p>
          <p>Lamentamos informarte que la sesión grupal "<strong>${context.sessionTitle}</strong>" ha sido cancelada.</p>

          <div class="details">
            <p><strong>Motivo:</strong> No se alcanzó el mínimo de 4 participantes necesario para realizar la sesión.</p>
            <p><strong>Devolución:</strong> Se ha procesado la devolución de ${(context.refundAmount / 100).toFixed(0)} € a tu tarjeta.</p>
          </div>

          <p>La devolución puede tardar entre 3 y 5 días hábiles en aparecer en tu estado de cuenta, según tu banco.</p>

          <p>Puedes inscribirte en otra sesión grupal en:</p>
          <p><a href="https://laclasedigital.com/sesiones">laclasedigital.com/sesiones</a></p>

          <div class="footer">
            <p>IA y español: aprende más, aprende mejor</p>
            <p>laclasedigital.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 6. SESIÓN GRUPAL CANCELADA (FORMADOR)
// ============================================
export const groupSessionCancelledFormadorTemplate = (
  context: EmailContext & {
    sessionTitle: string;
    sessionDate: string;
    enrolledCount: number;
  }
) => ({
  to: context.formadorEmail,
  subject: `Sesión cancelada por falta de participantes`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: #F5A623; color: #1A2535; padding: 2rem; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #F5A623; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Sesión Cancelada</h1>
        </div>
        <div class="content">
          <p>La siguiente sesión grupal ha sido cancelada automáticamente:</p>

          <div class="details">
            <p><strong>Sesión:</strong> ${context.sessionTitle}</p>
            <p><strong>Fecha:</strong> ${new Date(context.sessionDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Inscritos:</strong> ${context.enrolledCount} / mínimo necesario: 4</p>
          </div>

          <p>Se han procesado las devoluciones automáticas a todos los inscritos.</p>
        </div>
      </div>
    </body>
    </html>
  `,
})

// ============================================
// 7. ZOOM AÑADIDO A SESIÓN
// ============================================
export const zoomLinkAddedTemplate = (
  context: EmailContext & {
    sessionTitle: string;
    sessionDate: string;
    zoomLink: string;
  }
) => ({
  to: context.studentEmail,
  subject: `Enlace de conexión · ${context.sessionTitle}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1A2535; }
        .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: linear-gradient(135deg, #0A1628, #0F2744); padding: 2rem; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { color: #F5A623; margin: 0; font-size: 1.5rem; }
        .content { background: #F4F7FA; padding: 2rem; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
        .cta { display: block; background: #F5A623; color: #1A2535; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; margin: 1.5rem 0; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.85rem; color: #6B82A0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔗 Enlace de Conexión</h1>
        </div>
        <div class="content">
          <p>Hola ${context.studentName},</p>
          <p>Ya está disponible el enlace para unirte a la sesión:</p>

          <div class="details">
            <p><strong>Sesión:</strong> ${context.sessionTitle}</p>
            <p><strong>📅 Fecha y hora:</strong> ${new Date(context.sessionDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${new Date(context.sessionDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h</p>
          </div>

          <p><strong>🔗 Enlace de Zoom:</strong></p>
          <a href="${context.zoomLink}" class="cta">Unirse a la sesión →</a>

          <p>Recuerda preparar tu repositorio GitHub con las actividades del curso.</p>

          <div class="footer">
            <p>IA y español: aprende más, aprende mejor</p>
            <p>laclasedigital.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
})
