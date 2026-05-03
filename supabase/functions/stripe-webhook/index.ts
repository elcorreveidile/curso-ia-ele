// Edge Function: stripe-webhook
// Procesa webhooks de Stripe para confirmar pagos y crear registros en Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.18.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar clientes
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Obtener firma y cuerpo
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    // Verificar firma del webhook (si hay secreto configurado)
    let event
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    } else {
      // En desarrollo, aceptar eventos sin verificación
      const payload = JSON.parse(body)
      event = { type: payload.type, data: { object: payload.data.object } }
    }

    console.log('Received event:', event.type)

    // Procesar evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata

      console.log('Processing checkout session:', session.id)
      console.log('Session type:', metadata.session_type)

      if (metadata.session_type === 'individual') {
        // Crear registro en individual_sessions
        const { error: insertError } = await supabase
          .from('individual_sessions')
          .insert({
            student_name: metadata.student_name,
            student_email: metadata.student_email,
            date: metadata.date,
            time: metadata.time,
            notes: metadata.notes || null,
            status: 'confirmed',
            stripe_payment_id: session.payment_intent as string,
            amount_paid: session.amount_total,
          })

        if (insertError) {
          console.error('Error inserting individual session:', insertError)
          throw insertError
        }

        console.log('Individual session created successfully')

        // TODO: Enviar emails
        // await sendIndividualSessionConfirmation(metadata.student_email, {
        //   date: metadata.date,
        //   time: metadata.time,
        //   amount: session.amount_total,
        // })

      } else if (metadata.session_type === 'group') {
        // Crear registro en group_enrollments
        const { error: insertError } = await supabase
          .from('group_enrollments')
          .insert({
            session_id: metadata.session_id,
            student_name: metadata.student_name,
            student_email: metadata.student_email,
            stripe_payment_id: session.payment_intent as string,
          })

        if (insertError) {
          console.error('Error inserting group enrollment:', insertError)
          throw insertError
        }

        console.log('Group enrollment created successfully')

        // Verificar si se alcanzó el mínimo
        const { data: sessionData } = await supabase
          .from('group_sessions_with_count')
          .select('enrolled_count, min_students, title, date')
          .eq('id', metadata.session_id)
          .single()

        if (sessionData) {
          console.log(`Enrollment count: ${sessionData.enrolled_count}/${sessionData.min_students}`)

          // Si se alcanzó el mínimo, podría confirmarse la sesión automáticamente
          // o notificar al formador
          if (sessionData.enrolled_count >= sessionData.min_students) {
            console.log('Minimum reached! Session could be confirmed.')
            // TODO: Notificar al formador
            // await notifyFormenderMinimumReached(metadata.session_id)
          }
        }

        // TODO: Enviar emails
        // await sendGroupEnrollmentConfirmation(metadata.student_email, {
        //   sessionTitle: sessionData?.title,
        //   sessionDate: sessionData?.date,
        //   amount: session.amount_total,
        // })
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
