import localforage from 'localforage'

const KEY = 'total_paws'

export async function getTotalPaws() {
  return (await localforage.getItem(KEY)) ?? 0
}

export function calcPaws(entry) {
  let p = 5
  if (entry.photo) p += 3
  if ((entry.text?.length ?? 0) > 50) p += 2
  return p
}

export async function addPaws(n) {
  const current = await getTotalPaws()
  const next = current + n
  await localforage.setItem(KEY, next)
  return next
}
