import { useState, useEffect, useRef, useMemo } from 'react'
import { addPaws } from '../lib/paws'
import { generateReply } from '../lib/reply'
import { saveEntry } from '../lib/storage'
import { syncEntry } from '../lib/sync'
import { shouldAddPoint, calcTotalDistance, formatDistance, formatDuration } from '../lib/geo'
import WalkMap from './WalkMap'
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

const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
const todName = (h) => h < 6 ? '이른 새벽' : h < 11 ? '아침' : h < 16 ? '한낮' : h < 19 ? '해질녘' : h < 22 ? '저녁' : '밤'

function resizeImage(file, size = 200) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2, sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = url
  })
}

export default function WalkTab({ onSaved }) {
  const [dogName, setDogName]         = useState(() => localStorage.getItem('dogidogi_dog_name') || '우리 강아지')
  const [dogPhoto, setDogPhoto]       = useState(() => localStorage.getItem('dogidogi_dog_photo') || null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [composer, setComposer]       = useState(null)
  const [customs,  setCustoms]        = useState([])
  const [screen,   setScreen]         = useState('idle')
  const [elapsed,  setElapsed]        = useState(0)
  const [started,  setStarted]        = useState(false)
  const [running,  setRunning]        = useState(false)

  // GPS 상태
  const [route,      setRoute]      = useState([])
  const [currentPos, setCurrentPos] = useState(null)
  const [gpsStatus,  setGpsStatus]  = useState('idle')  // idle | acquiring | ok | error

  const [pins,      setPins]        = useState([])  // 기록된 순간 (지도 마커 + 일지용)
  const [paws,      setPaws]        = useState(0)
  const [toasts,    setToasts]      = useState([])
  const [pulse,     setPulse]       = useState(null)
  const [pinEmoji,  setPinEmoji]    = useState(null)  // 강아지 핀 말풍선

  const [weather,   setWeather]     = useState('맑음')
  const [journal,   setJournal]     = useState('')
  const [bonus,     setBonus]       = useState(0)
  const [letter,    setLetter]      = useState('')
  const [generating, setGenerating] = useState(false)

  const watchIdRef       = useRef(null)
  const timerRef         = useRef(null)
  const pinEmojiTimer    = useRef(null)
  const press            = useRef({ timer: null, fired: false })

  const distanceM    = useMemo(() => calcTotalDistance(route), [route])
  const distanceStr  = formatDistance(distanceM)
  const tod          = todName(new Date().getHours())
  const canLog       = started && running
  const allBtns      = [...PRESETS, ...customs]
  const wEmoji       = (WEATHER.find(w => w.id === weather) || {}).emoji

  useEffect(() => { localStorage.setItem('dogidogi_dog_name', dogName) }, [dogName])

  // 산책 화면 진입 시 GPS 시작 (빠른 위치 확보)
  useEffect(() => {
    if (screen === 'walk') {
      startGPS()
    } else {
      stopGPS()
    }
    return () => stopGPS()
  }, [screen])

  // 타이머
  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  function startGPS() {
    if (!navigator.geolocation || watchIdRef.current != null) return
    setGpsStatus('acquiring')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setGpsStatus('ok')
        setCurrentPos({ lat, lng })
        setRoute(prev => shouldAddPoint(prev, lat, lng, 5) ? [...prev, { lat, lng }] : prev)
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    )
  }

  function stopGPS() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  function togglePlay() {
    if (!started) { setStarted(true); setRunning(true); return }
    setRunning(r => !r)
  }

  function reactPinEmoji(emoji) {
    clearTimeout(pinEmojiTimer.current)
    setPinEmoji(emoji)
    pinEmojiTimer.current = setTimeout(() => setPinEmoji(null), 2200)
  }

  function pushToast(emoji, minus) {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, emoji, minus }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 950)
  }

  function logMoment(tag) {
    if (!canLog) return
    const pos = currentPos || null
    setPins(ps => [...ps, {
      key: Date.now() + Math.random(),
      emoji: tag.emoji,
      label: tag.label,
      t: elapsed,
      pos,
    }])
    setPaws(n => n + 1)
    setPulse(tag.id); setTimeout(() => setPulse(null), 220)
    reactPinEmoji(tag.emoji)
    pushToast(tag.emoji, false)
  }

  function cancelMoment(tag) {
    if (!canLog) return
    let li = -1
    for (let i = pins.length-1; i >= 0; i--) {
      if (pins[i].label === tag.label) { li = i; break }
    }
    if (li < 0) return
    setPins(ps => ps.filter((_, i) => i !== li))
    setPaws(n => Math.max(0, n - 1))
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
    stopGPS()
    setScreen('journal')
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const resized = await resizeImage(file, 200)
    setDogPhoto(resized)
    localStorage.setItem('dogidogi_dog_photo', resized)
  }

  function removePhoto() {
    setDogPhoto(null)
    localStorage.removeItem('dogidogi_dog_photo')
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
      const walkText = `[산책] ${distanceStr} · ${fmt(elapsed)} · 기록: ${tagSummary}\n${journal.trim()}`
      const replyText = await generateReply(walkText)
      setLetter(replyText)
      await addPaws(totalPaws)
      const saved = await saveEntry({
        text: walkText,
        reply: replyText,
        paws: totalPaws,
        walkData: { distanceKm: distanceM / 1000, durationS: elapsed },
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
    setRoute([])
    setCurrentPos(null)
    setGpsStatus('idle')
    setPins([])
    setPaws(0)
    setPinEmoji(null)
    setJournal('')
    setBonus(0)
    setLetter('')
  }

  // ── IDLE ──────────────────────────────────────────────────────
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

  // ── LETTER ────────────────────────────────────────────────────
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
                  <span>{distanceStr}</span><i>·</i>
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

  // ── JOURNAL ───────────────────────────────────────────────────
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
            <div className="wt-recall-row">{tod} · {fmt(elapsed)} · {distanceStr} · 순간 {pins.length}개</div>
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

  // ── WALK ──────────────────────────────────────────────────────
  const eventPins = pins.filter(p => p.pos != null)

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
          <i>·</i><span>{distanceStr}</span>
          <i>·</i><span>순간 {pins.length}</span>
          <i>·</i><span className="wt-pawcount">🐾 {paws}</span>
          {gpsStatus === 'acquiring' && <span className="wt-gps acquiring" title="GPS 연결 중">●</span>}
          {gpsStatus === 'ok'        && <span className="wt-gps ok"        title="GPS 연결됨">●</span>}
          {gpsStatus === 'error'     && <span className="wt-gps err"       title="GPS 오류">⚠</span>}
        </div>
      </header>

      <div className="wt-mapwrap">
        <WalkMap
          route={route}
          currentPos={currentPos}
          eventPins={eventPins}
          dogPhoto={dogPhoto}
          dogName={dogName}
          pinEmoji={pinEmoji}
          started={started}
        />
        {!started && (
          <div className="wt-map-hint">▶ 시작을 누르면 경로가 그려져요</div>
        )}
        {gpsStatus === 'acquiring' && started && (
          <div className="wt-map-hint wt-gps-hint">GPS 위치 확인 중...</div>
        )}
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

      {/* 설정 시트 */}
      {settingsOpen && (
        <div className="wt-sheet-wrap" onClick={() => setSettingsOpen(false)}>
          <div className="wt-sheet" onClick={e => e.stopPropagation()}>
            <div className="wt-sheet-bar"/>
            <h3 className="wt-sheet-h">설정</h3>

            <label className="wt-field-label">강아지 이름</label>
            <input
              className="wt-hon-input"
              value={dogName}
              maxLength={8}
              onChange={e => setDogName(e.target.value)}
              placeholder="예: 보리, 콩이, 몽이"
            />

            <label className="wt-field-label" style={{ marginTop: 16 }}>강아지 사진</label>
            <p className="wt-sheet-p" style={{ marginBottom: 10 }}>지도 핀에 표시되는 사진이에요.</p>
            <div className="wt-photo-row">
              <div className="wt-photo-circle">
                {dogPhoto
                  ? <img src={dogPhoto} className="wt-photo-img" alt="강아지" />
                  : <span className="wt-photo-empty">🐕</span>
                }
              </div>
              <div className="wt-photo-btns">
                <label className="wt-photo-upload">
                  사진 {dogPhoto ? '변경' : '추가'}
                  <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                </label>
                {dogPhoto && (
                  <button className="wt-photo-remove" onClick={removePhoto}>삭제</button>
                )}
              </div>
            </div>

            <button className="wt-confirm" onClick={() => setSettingsOpen(false)}>완료</button>
          </div>
        </div>
      )}

      {/* 커스텀 버튼 만들기 */}
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
