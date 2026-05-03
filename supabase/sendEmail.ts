// Función auxiliar para enviar emails con Resend
// Uso en Edge Functions de Supabase

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  { to, subject, html }: SendEmailParams,
  resendApiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Javier Benítez Láinez <benitezl@go.ugr.es>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// EJEMPLO DE USO EN EDGE FUNCTION
// ============================================
/*
import { sendEmail } from './emails';
import { individualSessionConfirmedTemplate } from './emails';

// En stripe-webhook/index.ts, después de insertar en individual_sessions:

const emailTemplate = individualSessionConfirmedTemplate({
  studentName: metadata.student_name,
  studentEmail: metadata.student_email,
  date: metadata.date,
  time: metadata.time,
  amount: session.amount_total,
  formadorEmail: 'benitezl@go.ugr.es',
});

await sendEmail(emailTemplate, Deno.env.get('RESEND_API_KEY')!);

// Email al formador:
const formadorTemplate = individualSessionFormadorTemplate({
  studentName: metadata.student_name,
  studentEmail: metadata.student_email,
  date: metadata.date,
  time: metadata.time,
  notes: metadata.notes,
  formadorEmail: 'benitezl@go.ugr.es',
});

await sendEmail(formadorTemplate, Deno.env.get('RESEND_API_KEY')!);
*/
