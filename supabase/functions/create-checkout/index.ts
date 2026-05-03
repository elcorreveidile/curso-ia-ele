// Edge Function: create-checkout
// Crea una sesión de Stripe Checkout para sesiones individuales o grupales

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.18.0'

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
    const { session_type, session_id, student_name, student_email, date, time, notes } = await req.json()

    // Validar datos requeridos
    if (!session_type || !student_name || !student_email) {
      throw new Error('Faltan datos requeridos: session_type, student_name, student_email')
    }

    // Determinar precio según tipo de sesión
    const amount_cents = session_type === 'individual' ? 4500 : 1500
    const amount_float = amount_cents / 100

    // URLs de redirección
    const origin = req.headers.get('origin')
    const success_url = `${origin}/sesiones/confirmada?session_id={CHECKOUT_SESSION_ID}`
    const cancel_url = `${origin}/sesiones`

    // Crear metadata para Stripe
    const metadata: Record<string, string> = {
      session_type,
      student_name,
      student_email,
    }

    if (session_type === 'individual') {
      if (!date || !time) {
        throw new Error('Para sesiones individuales se requiere fecha y hora')
      }
      metadata.date = date
      metadata.time = time
      metadata.notes = notes || ''
    } else if (session_type === 'group') {
      if (!session_id) {
        throw new Error('Para sesiones grupales se requiere session_id')
      }
      metadata.session_id = session_id
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

    // Crear sesión de Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: session_type === 'individual'
              ? 'Sesión Individual · IA y español'
              : 'Sesión Grupal · IA y español',
            description: session_type === 'individual'
              ? '60 minutos de acompañamiento personalizado'
              : '60 minutos de sesión grupal (máximo 8 participantes)',
          },
          unit_amount: amount_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url,
      cancel_url,
      customer_email: student_email,
      metadata,
    })

    // Retornar URL de checkout
    return new Response(
      JSON.stringify({
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
