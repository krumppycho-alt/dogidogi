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
    if (value?.id && value?.created_at && !value?.trashed) entries.push(value)
  })
  return entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function getEntry(id) {
  return localforage.getItem(id)
}

export async function updateEntry(id, changes) {
  const entry = await localforage.getItem(id)
  if (!entry) return null
  const updated = { ...entry, ...changes, updated_at: new Date().toISOString() }
  await localforage.setItem(id, updated)
  return updated
}

export async function deleteEntry(id) {
  const entry = await localforage.getItem(id)
  if (!entry) return
  await localforage.setItem(id, {
    ...entry,
    trashed: true,
    trashed_at: new Date().toISOString(),
  })
}

export async function getTrashEntries() {
  const entries = []
  await localforage.iterate((value) => {
    if (value?.id && value?.created_at && value?.trashed) entries.push(value)
  })
  return entries.sort((a, b) => new Date(b.trashed_at) - new Date(a.trashed_at))
}

export async function restoreEntry(id) {
  const entry = await localforage.getItem(id)
  if (!entry) return null
  const { trashed, trashed_at, ...rest } = entry
  await localforage.setItem(id, rest)
  return rest
}

export async function permanentlyDelete(id) {
  await localforage.removeItem(id)
}
