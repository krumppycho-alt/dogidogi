import localforage from 'localforage'

localforage.config({ name: 'dogidogi', storeName: 'entries' })

export async function saveEntry(entry) {
  const id = crypto.randomUUID()
  const data = { ...entry, id, created_at: new Date().toISOString() }
  await localforage.setItem(id, data)
  return data
}

export async function getAllEntries() {
  const entries = []
  await localforage.iterate((value) => {
    // device_id, total_paws, reply_recent_signals 같은 non-entry 키 제외
    if (value?.id && value?.created_at) entries.push(value)
  })
  return entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
