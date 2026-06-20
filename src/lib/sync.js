import { createClient } from '@supabase/supabase-js'
import localforage from 'localforage'

const URL  = import.meta.env.VITE_SUPABASE_URL
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = URL && KEY ? createClient(URL, KEY) : null

const DEVICE_KEY = 'device_id'

async function getDeviceId() {
  let id = await localforage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    await localforage.setItem(DEVICE_KEY, id)
  }
  return id
}

// fire-and-forget: 실패해도 앱 동작에 영향 없음
export async function syncEntry(entry) {
  if (!supabase) return
  try {
    const device_id = await getDeviceId()
    await supabase.from('entries').insert({
      id: entry.id,
      device_id,
      has_photo: !!entry.photo,
      paws: entry.paws,
      created_at: entry.created_at,
    })
  } catch {
    // 조용히 실패
  }
}
