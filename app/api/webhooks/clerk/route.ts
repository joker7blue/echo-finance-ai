import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) throw new Error('Missing CLERK_WEBHOOK_SECRET')

  // Verify webhook signature
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle events
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await supabase.from('users').insert({
      id,
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await supabase.from('users').update({
      email: email_addresses[0].email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim(),
      avatar_url: image_url,
    }).eq('id', id)
  }

  if (evt.type === 'user.deleted') {
    await supabase.from('users').delete().eq('id', evt.data.id)
  }

  return Response.json({ success: true })
}