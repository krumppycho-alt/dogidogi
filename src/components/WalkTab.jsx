import { useState, useEffect, useRef, useCallback } from 'react'
import DogSVG from '../animations/DogSVG'
import PawReward from '../animations/PawReward'
import { getBreed, BREED_LIST } from '../lib/breeds'
import {
  haversineDistance, calcTotalDistance, formatDuration, formatDistance,
  routeToSVGPath, shouldAddPoint, calcWalkPaws
} from '../lib/geo'
import { addPaws } from '../lib/paws'
import { generateReply } from '../lib/reply'
import { saveEntry } from '../lib/storage'
import { syncEntry } from '../lib/sync'
import './WalkTab.css'

const DEFAULT_BREED_ID = 'mixed'

export default function WalkTab() {
  const [walkState, setWalkState] = useState('idle')  // idle | active | paused | summary
  const [breedId, setBreedId] = useState(DEFAULT_BREED_ID)
  const [showBreedPicker, setShowBreedPicker] = useState(false)

  // 진행 중 산책 데이터
  const [route, setRoute] = useState([])
  const [elapsed, setElapsed] = useState(0)  // 초
  const [gpsStatus, setGpsStatus] = useState('idle')  // idle | acquiring | ok | error

  // 산책 완료 데이터
  const [summary, setSummary] = useState(null)  // { distanceM, durationS, route, paws, totalPaws, reply, entry }
  const [showPawReward, setShowPawReward] = useState(false)

  // 일기 추가 (산책 후)
  const [walkNote, setWalkNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const watchIdRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedElapsedRef = useRef(0)

  const breed = getBreed(breedId)

  // ── GPS 추적 ────────────────────────────────────────────────
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      return
    }
    setGpsStatus('acquiring')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setGpsStatus('ok')
        setRoute(prev => {
          if (shouldAddPoint(prev, lat, lng, 3)) {
            return [...prev, { lat, lng, accuracy }]
          }
          return prev
        })
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    )
  }, [])

  const stopGPS = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // ── 타이머 ───────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  // ── 산책 시작 ────────────────────────────────────────────────
  function handleStart() {
    setRoute([])
    setElapsed(0)
    pausedElapsedRef.current = 0
    setWalkNote('')
    setWalkState('active')
    startGPS()
    startTimer()
  }

  // ── 일시정지 ─────────────────────────────────────────────────
  function handlePause() {
    stopGPS()
    stopTimer()
    pausedElapsedRef.current = elapsed
    setWalkState('paused')
  }

  function handleResume() {
    setWalkState('active')
    startGPS()
    startTimer()
  }

  // ── 산책 종료 ────────────────────────────────────────────────
  async function handleStop() {
    stopGPS()
    stopTimer()
    const distanceM = calcTotalDistance(route)
    const paws = calcWalkPaws(distanceM)
    const totalPaws = await addPaws(paws)
    const replyText = await generateReply(`산책 ${formatDistance(distanceM)} 완료! ${formatDuration(elapsed)} 걸었어.`)
    setSummary({ distanceM, durationS: elapsed, route: [...route], paws, totalPaws, reply: replyText })
    setWalkState('summary')
    setShowPawReward(true)
  }

  // ── 일기 저장 (산책 후 메모) ──────────────────────────────────
  async function handleSaveNote() {
    if (!walkNote.trim()) return handleDone()
    setSavingNote(true)
    const draft = {
      text: `[산책] ${formatDistance(summary.distanceM)} · ${formatDuration(summary.durationS)}\n${walkNote}`,
      reply: summary.reply,
      paws: summary.paws,
      walkData: { distanceM: summary.distanceM, durationS: summary.durationS },
    }
    const saved = await saveEntry(draft)
    syncEntry(saved)
    setSavingNote(false)
    handleDone()
  }

  function handleDone() {
    setWalkState('idle')
    setSummary(null)
    setRoute([])
    setElapsed(0)
    pausedElapsedRef.current = 0
    setWalkNote('')
    setShowPawReward(false)
  }

  // cleanup on unmount
  useEffect(() => () => {
    stopGPS()
    stopTimer()
  }, [stopGPS, stopTimer])

  const distanceM = calcTotalDistance(route)

  // ── IDLE ─────────────────────────────────────────────────────
  if (walkState === 'idle') {
    return (
      <div className="walk-tab walk-idle">
        <div className="walk-dog-area">
          <DogSVG breed={breed} animation="sitting" size={130} />
          <button className="breed-pill" onClick={() => setShowBreedPicker(v => !v)}>
            {breed.emoji} {breed.name} ▾
          </button>
          {showBreedPicker && (
            <div className="breed-picker">
              {BREED_LIST.map(b => (
                <button
                  key={b.id}
                  className={`breed-opt${b.id === breedId ? ' selected' : ''}`}
                  onClick={() => { setBreedId(b.id); setShowBreedPicker(false) }}
                >
                  {b.emoji} {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <h2 className="walk-idle-title">산책하러 갈까요?</h2>
        <p className="walk-idle-sub">GPS가 경로와 거리를 기록해요</p>

        <button className="walk-start-btn" onClick={handleStart}>
          산책 시작
        </button>
      </div>
    )
  }

  // ── ACTIVE / PAUSED ──────────────────────────────────────────
  if (walkState === 'active' || walkState === 'paused') {
    const svgPath = routeToSVGPath(route, 200, 200)
    const isActive = walkState === 'active'

    return (
      <div className="walk-tab walk-active">
        {/* GPS 상태 */}
        <div className={`gps-badge gps-${gpsStatus}`}>
          {gpsStatus === 'acquiring' && <><span className="pulse-ring gps-dot" />GPS 연결 중…</>}
          {gpsStatus === 'ok'        && <><span className="gps-dot ok" />GPS 연결됨</>}
          {gpsStatus === 'error'     && <>⚠ GPS 오류 — Wi-Fi로 대체</>}
        </div>

        {/* 통계 */}
        <div className="walk-stats">
          <div className="walk-stat">
            <span className="walk-stat-value">{formatDuration(elapsed)}</span>
            <span className="walk-stat-label">시간</span>
          </div>
          <div className="walk-stat-divider" />
          <div className="walk-stat">
            <span className="walk-stat-value">{formatDistance(distanceM)}</span>
            <span className="walk-stat-label">거리</span>
          </div>
          <div className="walk-stat-divider" />
          <div className="walk-stat">
            <span className="walk-stat-value">{calcWalkPaws(distanceM)}</span>
            <span className="walk-stat-label">🐾 예상</span>
          </div>
        </div>

        {/* 루트 지도 */}
        <div className="walk-route-box">
          {route.length < 2 ? (
            <div className="walk-route-empty">
              <DogSVG breed={breed} animation={isActive ? 'sniffing' : 'sitting'} size={80} />
              <span className="walk-route-hint">걷기 시작하면 경로가 표시됩니다</span>
            </div>
          ) : (
            <svg viewBox="0 0 200 200" className="walk-route-svg">
              <rect width="200" height="200" rx="16" fill="#f5efe8" />
              <path d={svgPath} stroke="#c97a3a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* 시작점 */}
              <circle cx={route[0] && routeStartPt(route, 200, 200).x} cy={route[0] && routeStartPt(route, 200, 200).y} r="5" fill="#5c3d1e" />
              {/* 현재 위치 */}
              <circle cx={routeEndPt(route, 200, 200).x} cy={routeEndPt(route, 200, 200).y} r="5" fill="#e06830" />
            </svg>
          )}
        </div>

        {/* 컨트롤 */}
        <div className="walk-controls">
          {isActive ? (
            <button className="walk-ctrl-btn pause" onClick={handlePause}>⏸ 일시정지</button>
          ) : (
            <button className="walk-ctrl-btn resume" onClick={handleResume}>▶ 계속하기</button>
          )}
          <button className="walk-ctrl-btn stop" onClick={handleStop}>⏹ 산책 완료</button>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  if (walkState === 'summary' && summary) {
    return (
      <div className="walk-tab walk-summary">
        {showPawReward && (
          <PawReward count={Math.min(summary.paws, 12)} onDone={() => setShowPawReward(false)} />
        )}

        <div className="summary-dog">
          <DogSVG breed={breed} animation="walking" size={100} />
        </div>

        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-stat-icon">📍</span>
            <span className="summary-stat-val">{formatDistance(summary.distanceM)}</span>
            <span className="summary-stat-lbl">거리</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-icon">⏱</span>
            <span className="summary-stat-val">{formatDuration(summary.durationS)}</span>
            <span className="summary-stat-lbl">시간</span>
          </div>
          <div className="summary-stat paw-stat">
            <span className="summary-stat-icon">🐾</span>
            <span className="summary-stat-val">+{summary.paws}</span>
            <span className="summary-stat-lbl">발자국</span>
          </div>
        </div>

        {summary.reply && (
          <div className="summary-reply-bubble">
            <p>{summary.reply.split('\n')[0]}</p>
          </div>
        )}

        <div className="summary-note-area">
          <textarea
            className="summary-note-input"
            placeholder="오늘 산책 한 줄 일기 (선택)"
            value={walkNote}
            onChange={e => setWalkNote(e.target.value)}
            rows={2}
            maxLength={150}
          />
        </div>

        <div className="summary-actions">
          <button className="summary-save-btn" onClick={handleSaveNote} disabled={savingNote}>
            {savingNote ? '저장 중…' : walkNote.trim() ? '기록하고 끝내기' : '끝내기'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

// SVG 좌표 계산 헬퍼
function routeStartPt(points, w, h) {
  return calcRoutePt(points, 0, w, h)
}
function routeEndPt(points, w, h) {
  return calcRoutePt(points, points.length - 1, w, h)
}
function calcRoutePt(points, idx, w, h, pad = 16) {
  if (!points.length) return { x: w / 2, y: h / 2 }
  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const rangeW = maxLng - minLng || 0.0001
  const rangeH = maxLat - minLat || 0.0001
  const usableW = w - pad * 2
  const usableH = h - pad * 2
  const scale = Math.min(usableW / rangeW, usableH / rangeH)
  const offsetX = pad + (usableW - rangeW * scale) / 2
  const offsetY = pad + (usableH - rangeH * scale) / 2
  const p = points[idx]
  return {
    x: offsetX + (p.lng - minLng) * scale,
    y: offsetY + (maxLat - p.lat) * scale,
  }
}
