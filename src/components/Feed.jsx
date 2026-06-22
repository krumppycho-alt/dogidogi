import { useEffect, useState } from 'react'
import { getAllEntries } from '../lib/storage'
import { getTotalPaws } from '../lib/paws'
import DogSVG from '../animations/DogSVG'
import { getBreed } from '../lib/breeds'
import './Feed.css'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

function calcStreak(entries) {
  if (!entries?.length) return 0
  const dates = new Set(entries.map(e => e.created_at.slice(0, 10)))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) streak++
    else break
  }
  return streak
}

function calcMonthCount(entries) {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return entries?.filter(e => e.created_at.startsWith(ym)).length ?? 0
}

function EntryCard({ entry }) {
  return (
    <article className={`entry-card${entry.photo ? '' : ' no-photo'}`}>
      {entry.photo && (
        <div className="card-photo">
          <img src={entry.photo} alt="오늘의 도기" />
        </div>
      )}
      <div className="card-body">
        <time className="card-date">{formatDate(entry.created_at)}</time>
        <p className="card-text">{entry.text}</p>
        {entry.reply && (
          <div className="card-reply">
            <span className="reply-dog">🐶</span>
            <p>{entry.reply.split('\n')[0]}</p>
          </div>
        )}
      </div>
    </article>
  )
}

function StatsWidget({ streak, monthCount }) {
  if (!streak && !monthCount) return null
  return (
    <div className="stats-widget">
      {streak >= 2 && (
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{streak}일</span>
          <span className="stat-label">연속 기록</span>
        </div>
      )}
      {streak === 1 && (
        <div className="stat-item">
          <span className="stat-icon">🐾</span>
          <span className="stat-value">오늘</span>
          <span className="stat-label">기록 완료</span>
        </div>
      )}
      {monthCount > 0 && (
        <div className="stat-item">
          <span className="stat-icon">📅</span>
          <span className="stat-value">{monthCount}번</span>
          <span className="stat-label">이번 달</span>
        </div>
      )}
    </div>
  )
}

export default function Feed({ onRecord }) {
  const [entries, setEntries] = useState(null)
  const [totalPaws, setTotalPaws] = useState(0)

  useEffect(() => {
    getAllEntries().then(setEntries)
    getTotalPaws().then(setTotalPaws)
  }, [])

  const streak = calcStreak(entries)
  const monthCount = calcMonthCount(entries)

  return (
    <div className="feed">
      {totalPaws > 0 && (
        <div className="paws-bar">
          <span>🐾</span>
          <span>발자국 {totalPaws}개</span>
        </div>
      )}

      <StatsWidget streak={streak} monthCount={monthCount} />

      <div className="feed-list">
        {entries === null && <p className="feed-loading">불러오는 중…</p>}

        {entries?.length === 0 && (
          <div className="feed-empty">
            <DogSVG breed={getBreed('mixed')} animation="sleeping" size={110} pose="front" />
            <p>아직 기록이 없어요</p>
            <small>도기와의 첫 번째 하루를 남겨보세요</small>
          </div>
        )}

        {entries?.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      <button className="fab" onClick={onRecord} aria-label="오늘 기록하기">
        ＋
      </button>
    </div>
  )
}
