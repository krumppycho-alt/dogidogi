import { useState, useEffect, useRef, useMemo } from 'react'
import { addPaws } from '../lib/paws'
import { generateReply } from '../lib/reply'
import { saveEntry } from '../lib/storage'
import { syncEntry } from '../lib/sync'
import './WalkTab.css'

const PRESETS = [
  { id: '신남', emoji: '😄', label: '신남' },
  { id: '똥',  emoji: '💩', label: '똥'  },
  { id: '쉬',  emoji: '💦', label: '쉬'  },
  { id: '친구', emoji: '🐕', label: '친구' },
  { id: '거부', emoji: '🙅', label: '거부' },
  { id: '새길', emoji: '🗺️', label: '새길' },
  { id: '지침', emoji: '🫠', label: '지침' },
  { id: '물',  emoji: '💧', label: '물'  },
  { id: '간식', emoji: '🦴', label: '간식' },
]
const EMOJI_CHOICES = ['🐾','🌳','🐦','🐈','🚗','🌧️','🥎','😴','🤝','🌸','🍖','💨']
const WEATHER = [
  { id: '맑음', emoji: '☀️' },
  { id: '더움', emoji: '🥵' },
  { id: '비',   emoji: '🌧️' },
  { id: '흐림', emoji: '☁️' },
  { id: '추움', emoji: '❄️' },
]

const W = 340, H = 360, TRAVERSE_SEC = 60, FULL_KM = 1.7
const BLOCKS = [
  { x: 24,  y: 46,  w: 80, h: 58 },
  { x: 232, y: 38,  w: 84, h: 64, park: true },
  { x: 40,  y: 154, w: 66, h: 78 },
  { x: 234, y: 146, w: 82, h: 86 },
  { x: 120, y: 248, w: 90, h: 62, park: true },
  { x: 28,  y: 258, w: 64, h: 70 },
]
const SH = [62, 136, 214, 282], SV = [80, 170, 256]

function makeWaypoints() {
  const pts = [[170, 322]]; let x = 170, y = 322
  ;[[-70,-42],[40,-48],[76,-38],[-30,-50],[-84,-38],[24,-48],[68,-40],[-42,-32]].forEach(([dx,dy]) => {
    x = Math.max(38, Math.min(W-38, x + dx + (Math.random()*20-10)))
    y = Math.max(34, Math.min(H-34, y + dy + (Math.random()*14-7)))
    pts.push([Math.round(x), Math.round(y)])
  })
  return pts
}

function sampleRoute(pts) {
  const out = [{ x: pts[0][0], y: pts[0][1] }], steps = 18
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = out[out.length-1]
    const c  = { x: pts[i][0], y: pts[i][1] }
    const m  = { x: (pts[i][0]+pts[i+1][0])/2, y: (pts[i][1]+pts[i+1][1])/2 }
    for (let s = 1; s <= steps; s++) {
      const t = s/steps
      out.push({ x:(1-t)*(1-t)*p0.x+2*(1-t)*t*c.x+t*t*m.x, y:(1-t)*(1-t)*p0.y+2*(1-t)*t*c.y+t*t*m.y })
    }
  }
  const last = pts[pts.length-1], p0 = out[out.length-1]
  for (let s = 1; s <= steps; s++) {
    const t = s/steps
    out.push({ x: p0.x+(last[0]-p0.x)*t, y: p0.y+(last[1]-p0.y)*t })
  }
  return out
}

const poly  = (a) => a.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
const fmt   = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
const todName = (h) => h < 6 ? '이른 새벽' : h < 11 ? '아침' : h < 16 ? '한낮' : h < 19 ? '해질녘' : h < 22 ? '저녁' : '밤'

export default function WalkTab({ onSaved }) {
  const [dogName, setDogName]       = useState(() => localStorage.getItem('dogidogi_dog_name') || '우리 강아지')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [composer, setComposer]     = useState(null)
  const [customs,  setCustoms]      = useState([])
  const [screen,   setScreen]       = useState('idle')   // idle | walk | journal | letter
  const [elapsed,  setElapsed]      = useState(0)
  const [progress, setProgress]     = useState(0)
  const [started,  setStarted]      = useState(false)
  const [running,  setRunning]      = useState(false)
  const [pins,     setPins]         = useState([])
  const [paws,     setPaws]         = useState(0)
  const [toasts,   setToasts]       = useState([])
  const [pulse,    setPulse]        = useState(null)
  const [info,     setInfo]         = useState(null)
  const [weather,  setWeather]      = useState('맑음')
  const [journal,  setJournal]      = useState('')
  const [bonus,    setBonus]        = useState(0)
  const [letter,   setLetter]       = useState('')
  const [generating, setGenerating] = useState(false)
  const infoT = useRef(null)
  const press = useRef({ timer: null, fired: false })

  const points  = useMemo(() => sampleRoute(makeWaypoints()), [])
  const idx     = Math.floor(progress * (points.length - 1))
  const dogPt   = points[Math.min(idx, points.length - 1)]
  const distance = (progress * FULL_KM).toFixed(2)
  const tod     = todName(new Date().getHours())
  const canLog  = started && running
  const allBtns = [...PRESETS, ...customs]

  useEffect(() => { localStorage.setItem('dogidogi_dog_name', dogName) }, [dogName])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setElapsed(e => e + 1)
      setProgress(p => Math.min(1, p + 1/TRAVERSE_SEC))
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => () => clearTimeout(infoT.current), [])

  function togglePlay() {
    if (!started) { setStarted(true); setRunning(true); return }
    setRunning(r => !r)
  }

  function pushToast(emoji, minus) {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, emoji, minus }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 950)
  }

  function logMoment(tag) {
    if (!canLog) return
    const p = points[Math.min(idx, points.length-1)]
    setPins(ps => [...ps, { key: Date.now()+Math.random(), emoji: tag.emoji, label: tag.label, t: elapsed, x: p.x, y: p.y }])
    setPaws(n => n + 1)
    setPulse(tag.id); setTimeout(() => setPulse(null), 220)
    pushToast(tag.emoji, false)
  }

  function cancelMoment(tag) {
    if (!canLog) return
    let li = -1
    for (let i = pins.length-1; i >= 0; i--) { if (pins[i].label === tag.label) { li = i; break } }
    if (li < 0) return
    setPins(ps => ps.filter((_,i) => i !== li))
    setPaws(n => Math.max(0, n-1))
    pushToast(tag.emoji, true)
  }

  function onDown(tag) {
    press.current.fired = false
    clearTimeout(press.current.timer)
    press.current.timer = setTimeout(() => { press.current.fired = true; cancelMoment(tag) }, 450)
  }
  function onUp(tag) {
    clearTimeout(press.current.timer)
    if (!press.current.fired) logMoment(tag)
    press.current.fired = false
  }
  function onLeave() { clearTimeout(press.current.timer); press.current.fired = false }

  function tapPin(p) {
    clearTimeout(infoT.current)
    setInfo(`${p.emoji} ${p.label} · ${fmt(p.t)}`)
    infoT.current = setTimeout(() => setInfo(null), 2000)
  }

  function openComposer() { if (customs.length < 2) setComposer({ emoji: EMOJI_CHOICES[0], label: '' }) }
  function confirmCustom() {
    const l = composer.label.trim()
    if (!l || customs.length >= 2) return
    setCustoms(c => [...c, { id: 'c'+Date.now(), emoji: composer.emoji, label: l }])
    setComposer(null)
  }
  function removeCustom(id) { setCustoms(c => c.filter(x => x.id !== id)) }

  function goToJournal() {
    setRunning(false)
    setScreen('journal')
  }

  async function makeLetter() {
    setScreen('letter')
    setGenerating(true)
    setLetter('')
    const earned = journal.trim() ? 10 : 0
    setBonus(earned)
    const totalPaws = paws + earned
    if (earned) setPaws(totalPaws)

    try {
      const counts = {}
      pins.forEach(p => { counts[p.label] = (counts[p.label] || 0) + 1 })
      const tagSummary = Object.entries(counts).map(([k,v]) => `${k} ${v}번`).join(', ') || '없음'
      const walkText = `[산책] ${distance}km · ${fmt(elapsed)} · 기록: ${tagSummary}\n${journal.trim()}`
      const replyText = await generateReply(walkText)
      setLetter(replyText)
      await addPaws(totalPaws)
      const saved = await saveEntry({
        text: walkText,
        reply: replyText,
        paws: totalPaws,
        walkData: { distanceKm: parseFloat(distance), durationS: elapsed },
        activities: pins.map(p => ({ emoji: p.emoji, label: p.label, t: p.t })),
      })
      syncEntry(saved)
      onSaved?.()
    } catch {
      setLetter('오늘 산책도 정말 좋았어!')
    }
    setGenerating(false)
  }

  function newWalk() {
    setScreen('idle')
    setStarted(false)
    setRunning(false)
    setElapsed(0)
    setProgress(0)
    setPins([])
    setPaws(0)
    setJournal('')
    setBonus(0)
    setLetter('')
  }

  const wEmoji = (WEATHER.find(w => w.id === weather) || {}).emoji

  // ── IDLE ─────────────────────────────────────────────────────
  if (screen === 'idle') {
    return (
      <div className="wt-idle">
        <div className="wt-idle-paw">🐾</div>
        <b className="wt-idle-name">{dogName}</b>
        <p className="wt-idle-sub">와 산책할 준비가 됐어요</p>
        <button className="wt-idle-btn" onClick={() => setScreen('walk')}>산책 시작</button>
      </div>
    )
  }

  // ── LETTER ───────────────────────────────────────────────────
  if (screen === 'letter') {
    return (
      <div className="wt-overlay">
        <div className="wt-letter-wrap">
          <div className="wt-env">
            <div className="wt-env-stripe" />
            <div className="wt-env-head">
              <span className="wt-paw">🐾</span>
              <b>{dogName}의 답장</b>
            </div>
            {generating ? (
              <div className="wt-loading">
                <div className="wt-dots"><span /><span /><span /></div>
                <p>{dogName}가 일지를 읽고 답장을 쓰는 중...</p>
              </div>
            ) : (
              <>
                <div className="wt-letter-body">
                  {letter.split(/\n{2,}/).map((para, i) => para.trim() && <p key={i}>{para.trim()}</p>)}
                </div>
                <div className="wt-sign">{dogName} 올림 🐾</div>
                <div className="wt-env-stats">
                  <span>{tod}</span><i>·</i>
                  <span>{wEmoji} {weather}</span><i>·</i>
                  <span>{fmt(elapsed)}</span><i>·</i>
                  <span>{distance}km</span><i>·</i>
                  <span>순간 {pins.length}</span>
                </div>
                {bonus > 0 && <div className="wt-bonus">🐾 일지 보너스 +{bonus} · 누적 {paws}</div>}
              </>
            )}
          </div>
          {!generating && (
            <button className="wt-again" onClick={newWalk}>새 산책 시작</button>
          )}
        </div>
      </div>
    )
  }

  // ── JOURNAL ──────────────────────────────────────────────────
  if (screen === 'journal') {
    const counts = {}
    pins.forEach(p => { counts[p.label] = (counts[p.label] || 0) + 1 })
    return (
      <div className="wt-overlay">
        <header className="wt-hd">
          <div className="wt-hd-top">
            <div className="wt-hd-name">
              <span className="wt-paw">🐾</span>
              <b>오늘의 산책일지</b>
            </div>
          </div>
        </header>
        <div className="wt-journal-body">
          <div className="wt-recall">
            <div className="wt-recall-row">{tod} · {fmt(elapsed)} · {distance}km · 순간 {pins.length}개</div>
            <div className="wt-chips">
              {Object.entries(counts).map(([k,v]) => (
                <span key={k} className="wt-chip">
                  {(allBtns.find(t => t.label === k) || {}).emoji} {k} {v}
                </span>
              ))}
              {pins.length === 0 && <span className="wt-chip wt-muted">기록된 순간 없음</span>}
            </div>
          </div>
          <label className="wt-field-label">오늘 날씨</label>
          <div className="wt-weather-row">
            {WEATHER.map(w => (
              <button key={w.id} className={`wt-wbtn${weather === w.id ? ' on' : ''}`} onClick={() => setWeather(w.id)}>
                {w.emoji} {w.id}
              </button>
            ))}
          </div>
          <label className="wt-field-label">{dogName}에게 오늘 산책 이야기를 들려주세요</label>
          <textarea
            className="wt-journal-input"
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="예: 오늘 좀 더웠는데 새 길로 가봤어. 거기서 친구도 만나고 풀밭에서 신났네."
            rows={5}
          />
          <p className="wt-hint">자세히 적을수록 {dogName}의 답장이 진해져요. 일지를 남기면 🐾 보너스도 받아요.</p>
        </div>
        <footer className="wt-ft wt-jft">
          <button className="wt-ghost" onClick={makeLetter}>건너뛰고 답장 받기</button>
          <button className="wt-end" onClick={makeLetter} disabled={!journal.trim()}>
            일지 남기고 답장 🐾+10
          </button>
        </footer>
      </div>
    )
  }

  // ── WALK ─────────────────────────────────────────────────────
  return (
    <div className="wt-overlay">
      <header className="wt-hd">
        <div className="wt-hd-top">
          <div className="wt-hd-name">
            <span className="wt-paw">🐾</span>
            <b>{dogName}</b>
            <span className="wt-sub">
              {!started ? '와 산책 준비' : running ? '랑 걷는 중' : '랑 쉬는 중'}
            </span>
          </div>
          <div className="wt-hd-right">
            <button className="wt-gear" onClick={() => setSettingsOpen(true)} aria-label="설정">⚙</button>
            <button className={`wt-ctrl ${running ? 'pause' : 'go'}`} onClick={togglePlay}>
              {running ? (
                <svg viewBox="0 0 12 12">
                  <rect x="2.6" y="1.6" width="2.6" height="8.8" rx="1"/>
                  <rect x="6.8" y="1.6" width="2.6" height="8.8" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 12 12"><path d="M2.5 1.4 L10.6 6 L2.5 10.6 Z"/></svg>
              )}
              <span>{!started ? '시작' : running ? '멈춤' : '재생'}</span>
            </button>
          </div>
        </div>
        <div className="wt-hd-stats">
          <span className={`wt-clock${started && !running ? ' dim' : ''}`}>{fmt(elapsed)}</span>
          <i>·</i><span>{distance}km</span>
          <i>·</i><span>순간 {pins.length}</span>
          <i>·</i><span className="wt-pawcount">🐾 {paws}</span>
        </div>
      </header>

      <div className="wt-mapwrap">
        <svg className="wt-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="산책 경로">
          <rect x="0" y="0" width={W} height={H} className="wt-map-bg"/>
          <g className="wt-streets">
            {SH.map(y => <line key={'h'+y} x1="0" y1={y} x2={W} y2={y}/>)}
            {SV.map(x => <line key={'v'+x} x1={x} y1="0" x2={x} y2={H}/>)}
          </g>
          {BLOCKS.map((b,i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="9"
              className={b.park ? 'wt-block wt-park' : 'wt-block'}/>
          ))}
          <polyline className="wt-route-base" points={poly(points)}/>
          {idx > 1 && <polyline className="wt-route-live" points={poly(points.slice(0, idx+1))}/>}
          <circle cx={points[0].x} cy={points[0].y} r="20" className="wt-start-fuzz"/>
          <circle cx={points[0].x} cy={points[0].y} r="5"  className="wt-start-dot"/>
          {pins.map(p => (
            <g key={p.key} className="wt-pin" transform={`translate(${p.x} ${p.y})`}
              onClick={() => tapPin(p)} role="button">
              <circle r="14" className="wt-pin-bg"/>
              <text y="5" textAnchor="middle" className="wt-pin-emo">{p.emoji}</text>
            </g>
          ))}
          {started && (
            <g className="wt-dogmark" transform={`translate(${dogPt.x} ${dogPt.y})`}>
              <circle r="15" className="wt-dogmark-bg"/>
              <text y="6" textAnchor="middle" className="wt-dogmark-emo">🐕</text>
            </g>
          )}
        </svg>
        {info && <div className="wt-info-chip">{info}</div>}
        {!started && <div className="wt-map-hint">▶ 시작을 누르면 경로가 그려져요</div>}
        <div className="wt-toasts">
          {toasts.map(t => (
            <span key={t.id} className={`wt-toast${t.minus ? ' minus' : ''}`}>
              {t.emoji} {t.minus ? '취소' : '🐾 +1'}
            </span>
          ))}
        </div>
      </div>

      <div className="wt-tags-wrap">
        <div className="wt-tag-hint">짧게 눌러 기록 · 꾹 눌러 방금 기록 취소</div>
        <div className="wt-tags">
          {allBtns.map(tag => {
            const n   = pins.filter(p => p.label === tag.label).length
            const isC = tag.id.startsWith('c')
            return (
              <button
                key={tag.id}
                className={`wt-tag${isC ? ' mine' : ''}${pulse === tag.id ? ' tapped' : ''}`}
                disabled={!canLog}
                onPointerDown={() => onDown(tag)}
                onPointerUp={() => onUp(tag)}
                onPointerLeave={onLeave}
                onPointerCancel={onLeave}
                onContextMenu={e => e.preventDefault()}
              >
                {isC && (
                  <span className="wt-rm" role="button" aria-label="삭제"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); removeCustom(tag.id) }}>
                    ×
                  </span>
                )}
                <span className="wt-emo">{tag.emoji}</span>
                <span className="wt-lab">{tag.label}</span>
                {n > 0 && <span className="wt-cnt">{n}</span>}
              </button>
            )
          })}
          {customs.length < 2 && (
            <button className="wt-tag wt-add" onClick={openComposer}>
              <span className="wt-plus">＋</span>
              <span className="wt-lab">추가</span>
            </button>
          )}
        </div>
      </div>

      <footer className="wt-ft">
        {!started
          ? <p className="wt-ready-hint">버튼을 누르면 그 위치에 순간이 핀으로 박혀요.</p>
          : <button className="wt-end" onClick={goToJournal}>산책 끝내고 일지 쓰기</button>
        }
      </footer>

      {settingsOpen && (
        <div className="wt-sheet-wrap" onClick={() => setSettingsOpen(false)}>
          <div className="wt-sheet" onClick={e => e.stopPropagation()}>
            <div className="wt-sheet-bar"/>
            <h3 className="wt-sheet-h">강아지 이름</h3>
            <p className="wt-sheet-p">산책 화면에 표시되는 이름을 설정해요.</p>
            <label className="wt-field-label">이름</label>
            <input
              className="wt-hon-input"
              value={dogName}
              maxLength={8}
              onChange={e => setDogName(e.target.value)}
              placeholder="예: 보리, 콩이, 몽이"
            />
            <button className="wt-confirm" onClick={() => setSettingsOpen(false)}>완료</button>
          </div>
        </div>
      )}

      {composer && (
        <div className="wt-sheet-wrap" onClick={() => setComposer(null)}>
          <div className="wt-sheet" onClick={e => e.stopPropagation()}>
            <div className="wt-sheet-bar"/>
            <h3 className="wt-sheet-h">내 버튼 만들기</h3>
            <p className="wt-sheet-p">우리 {dogName}한테만 있는 순간을 버튼으로.</p>
            <div className="wt-preview">
              <span className="wt-emo wt-big">{composer.emoji}</span>
              <span className="wt-lab">{composer.label || '이름'}</span>
            </div>
            <div className="wt-emoji-row">
              {EMOJI_CHOICES.map(e => (
                <button key={e} className={`wt-e-pick${composer.emoji === e ? ' on' : ''}`}
                  onClick={() => setComposer(c => ({ ...c, emoji: e }))}>
                  {e}
                </button>
              ))}
            </div>
            <input
              className="wt-hon-input"
              placeholder="버튼 이름 (예: 다람쥐)"
              maxLength={5}
              value={composer.label}
              onChange={e => setComposer(c => ({ ...c, label: e.target.value }))}
            />
            <div className="wt-seg2" style={{ marginTop: 14 }}>
              <button onClick={() => setComposer(null)} style={{ color: 'var(--muted)' }}>취소</button>
              <button className="on" onClick={confirmCustom}>추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
