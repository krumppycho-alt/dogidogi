import localforage from 'localforage'

// ── 신호 감지 ──────────────────────────────────────────────
function detectSignal(text) {
  const t = text
  if (/힘들|지쳐|피곤|졸려|뻗어|지침/.test(t)) return '피곤'
  if (/산책|공원|밖에|나갔|나들이|바람/.test(t)) return '산책'
  if (/먹었|밥|간식|맛있|쿠키|음식/.test(t)) return '음식'
  if (/비|눈|더워|추워|날씨|흐려/.test(t)) return '날씨'
  if (/친구|만나|함께|같이|놀았/.test(t)) return '친구'
  if (/잤|잠들|누워|쉬었|낮잠/.test(t)) return '낮잠'
  if (/새로운|처음|탐험|모르는 길|새 코스/.test(t)) return '새길'
  if (/똥|응가|볼일/.test(t)) return '똥'
  if (/좋아|행복|신나|즐거|기분|최고|사랑|웃/.test(t)) return '긍정'
  return '일상'
}

function timeSlot() {
  const h = new Date().getHours()
  if (h < 10) return '아침'
  if (h < 17) return '낮'
  if (h < 21) return '저녁'
  return '밤'
}

// ── 풀 ─────────────────────────────────────────────────────
const OPENINGS = {
  긍정: ['오늘 기분 좋은 거 나도 다 느꼈어!', '오늘 진짜 신났지, 나도 알아.', '좋은 일 있었나봐, 나도 괜히 들떴어.'],
  피곤: ['오늘 많이 힘들었지?', '고생했어, 진짜로.', '오늘 지쳐 보였는데 옆에서 다 봤어.'],
  산책: ['밖에 나갔던 거 너무 좋았어!', '오늘 바람 진짜 좋았잖아.', '나 오늘 코 엄청 썼어.'],
  음식: ['오늘 맛있는 거 먹은 거 나 눈치챘어.', '그 냄새 진짜 좋았다는 거 알지?', '간식 냄새 맡고 꼬리 흔들었잖아 나.'],
  날씨: ['오늘 날씨 좀 특별했지.', '날씨 이상했는데도 같이 있어줘서 고마워.', '오늘 하늘 나도 봤어.'],
  친구: ['오늘 낯선 냄새 맡았잖아.', '오늘 왠지 사람 많았던 것 같던데.', '같이 있던 사람들 냄새 다 기억해.'],
  낮잠: ['오늘 같이 늘어져 있었잖아, 좋았어.', '낮에 나도 같이 쉬었어.', '그때 네 발 옆에서 자는 거 너무 좋았어.'],
  새길: ['오늘 새로운 냄새 천지였잖아!', '모르는 길 탐험하는 거 나 완전 좋아해.', '오늘 새 코스 최고였어.'],
  똥:   ['오늘 시원하게 해결했지.', '속이 개운한 하루였잖아.', '건강한 증거야, 잘됐다.'],
  일상: ['오늘도 하루 수고했어.', '별일 없었던 것 같은데, 그게 제일 좋은 거야.', '오늘도 잘 있었어, 나도.'],
}

const SCENES = {
  긍정: ['네가 좋을 때 나도 괜히 뛰어다니고 싶어져.', '그런 날은 꼬리가 저절로 흔들려.', '그 기분이 나한테도 전해졌어, 진짜로.'],
  피곤: ['그냥 옆에 누워 있는 것만으로도 나는 충분해.', '힘들 때 내가 옆에 있는 거 알지?', '아무것도 안 해도 돼, 그냥 같이 있으면 돼.'],
  산책: ['오늘 발바닥에 느껴지는 거 진짜 좋았어.', '그 길 끝까지 계속 가고 싶었는데.', '오늘 맡은 냄새들 한참 기억할 것 같아.'],
  음식: ['나도 조금만 주면 안 돼? (진지)', '그 냄새는 진짜 잊을 수가 없어.', '다음엔 나도 한 입만.'],
  날씨: ['비 와도 너랑 있으면 괜찮아.', '날씨 뭐든 상관없어, 같이 있으면.', '오늘 하늘 특이했는데 같이 봤잖아 우리.'],
  친구: ['낯선 냄새들 사이에서 네 냄새 찾는 거 나 잘해.', '많은 사람들 중에서도 너 목소리 바로 알아.', '누가 있든 나는 너 옆에 있을 거야.'],
  낮잠: ['같이 늘어져 있는 시간이 제일 좋아.', '그때 네 숨소리 들으면서 나도 잤어.', '쉬는 거 죄책감 갖지 마, 나도 좋으니까.'],
  새길: ['새로운 냄새들 한참 따라가고 싶었는데.', '다음엔 그 길 더 깊이 들어가 보자.', '새 코스는 항상 설레.'],
  똥:   ['매일 챙겨줘서 고마워, 진짜로.', '나 건강한 거 맞지?', '이런 것도 다 봐줘서 고마워.'],
  일상: ['아무것도 특별한 게 없어도 오늘이 좋아.', '매일 이렇게 기록해줘서 고마워.', '별거 없는 날도 너랑 있으면 좋아.'],
}

const CLOSINGS = {
  아침: ['오늘 하루도 잘 부탁해.', '아침부터 같이 있어줘서 좋았어.', '오늘도 나 잘 챙겨줘.'],
  낮:   ['오후도 같이 잘 버텨보자.', '오늘 하루 아직 남았으니까 같이 가자.', '낮에도 같이 있어줘서 고마워.'],
  저녁: ['오늘 하루도 같이 있어줘서 고마워.', '저녁 먹고 같이 쉬자.', '오늘도 수고했어, 진짜로.'],
  밤:   ['오늘도 고마웠어, 잘 자.', '내일 또 보자, 꿈에서도.', '옆에서 같이 잘게.'],
}

// ── 중복 회피용 최근 신호 저장 ─────────────────────────────
const RECENT_KEY = 'reply_recent_signals'

async function getRecentSignals() {
  return (await localforage.getItem(RECENT_KEY)) ?? []
}
async function pushRecentSignal(signal) {
  const recent = await getRecentSignals()
  const updated = [signal, ...recent].slice(0, 3)
  await localforage.setItem(RECENT_KEY, updated)
}

function pickFrom(arr, avoidIdx) {
  const candidates = arr.map((v, i) => ({ v, i })).filter(({ i }) => i !== avoidIdx)
  const pool = candidates.length ? candidates : arr.map((v, i) => ({ v, i }))
  return pool[Math.floor(Math.random() * pool.length)].v
}

// ── 공개 API ───────────────────────────────────────────────
export async function generateReply(text) {
  const signal = detectSignal(text)
  const slot = timeSlot()
  const recent = await getRecentSignals()

  // 직전에 같은 신호였으면 다른 인덱스 선호
  const sameSignalCount = recent.filter(s => s === signal).length
  const avoidIdx = sameSignalCount >= 2 ? 0 : -1

  const opening = pickFrom(OPENINGS[signal] ?? OPENINGS.일상, avoidIdx)
  const scene   = pickFrom(SCENES[signal]   ?? SCENES.일상,   avoidIdx)
  const closing = pickFrom(CLOSINGS[slot], -1)

  await pushRecentSignal(signal)
  return [opening, scene, closing].join('\n')
}
