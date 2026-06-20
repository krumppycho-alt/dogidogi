import { useEffect, useState } from 'react'
import { getAllEntries } from '../lib/storage'
import './Archive.css'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}
function fmtShort(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}.${d.getDate()}`
}

function EntryCard({ entry }) {
  return (
    <article className="entry-card">
      {entry.photo && (
        <div className="card-photo">
          <img src={entry.photo} alt="" loading="lazy" />
        </div>
      )}
      <div className="card-body">
        <time className="card-date">{fmtDate(entry.created_at)}</time>
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

function GridView({ entries, onOpen }) {
  if (!entries.length) return <div className="archive-empty"><span>🐾</span><p>아직 기록이 없어요</p></div>
  return (
    <div className="grid-wrap">
      {entries.map(e => (
        <div
          key={e.id}
          className={`grid-cell${e.photo ? '' : ' grid-text-cell'}`}
          onClick={() => onOpen(e)}
        >
          {e.photo ? (
            <>
              <img src={e.photo} alt="" loading="lazy" />
              <div className="grid-overlay">{fmtShort(e.created_at)}</div>
            </>
          ) : (
            <>
              <p className="grid-cell-text">{e.text}</p>
              <span className="grid-cell-date">{fmtShort(e.created_at)}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function CalendarView({ entries, calYear, calMonth, selectedDay, onPrev, onNext, onDayClick }) {
  const byDate = {}
  entries.forEach(e => {
    const k = e.created_at.slice(0, 10)
    if (!byDate[k]) byDate[k] = []
    byDate[k].push(e)
  })

  const label = new Date(calYear, calMonth, 1).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  const offset = (new Date(calYear, calMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const now = new Date()
  const isNowMonth = now.getFullYear() === calYear && now.getMonth() === calMonth

  const selKey = selectedDay != null
    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null
  const selEntries = selKey ? (byDate[selKey] ?? []) : []

  return (
    <div className="cal-view">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={onPrev}>‹</button>
        <span className="cal-month-label">{label}</span>
        <button className="cal-nav-btn" onClick={onNext}>›</button>
      </div>
      <div className="cal-day-names">
        {['월', '화', '수', '목', '금', '토', '일'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} className="cal-day" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const dk = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const has = !!byDate[dk]
          const cls = [
            'cal-day',
            has ? 'has-entry' : '',
            isNowMonth && d === now.getDate() ? 'today' : '',
            selectedDay === d ? 'selected' : '',
          ].filter(Boolean).join(' ')
          return (
            <div key={d} className={cls} onClick={has ? () => onDayClick(d) : undefined}>
              <span>{d}</span>
              {has && <div className="entry-dot" />}
            </div>
          )
        })}
      </div>
      {selectedDay != null && (
        <div className="cal-detail">
          <p className="cal-detail-label">
            {new Date(calYear, calMonth, selectedDay).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          {selEntries.map(e => <EntryCard key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  )
}

function TimelineView({ entries }) {
  if (!entries.length) return <div className="archive-empty"><span>🐾</span><p>아직 기록이 없어요</p></div>

  const months = {}
  entries.forEach(e => {
    const d = new Date(e.created_at)
    const k = `${d.getFullYear()}-${d.getMonth()}`
    if (!months[k]) {
      months[k] = { label: d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }), entries: [] }
    }
    months[k].entries.push(e)
  })

  return (
    <div className="timeline-wrap">
      {Object.values(months).map(m => (
        <div key={m.label} className="month-section">
          <div className="month-divider">
            <div className="divider-line" />
            <span className="divider-label">{m.label} · {m.entries.length}개</span>
            <div className="divider-line" />
          </div>
          <div className="month-entries">
            {m.entries.map(e => <EntryCard key={e.id} entry={e} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryModal({ entry, onClose }) {
  return (
    <div className="entry-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose}>✕</button>
        {entry.photo && (
          <div className="modal-photo">
            <img src={entry.photo} alt="" loading="lazy" />
          </div>
        )}
        <div className="modal-body">
          <time className="card-date">{fmtDate(entry.created_at)}</time>
          <p className="card-text">{entry.text}</p>
          {entry.reply && (
            <div className="modal-reply">
              <p className="modal-dog">🐶 도기의 답장</p>
              {entry.reply.split('\n').map((l, i) => <p key={i}>{l}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TABS = [
  { key: 'grid', label: '그리드' },
  { key: 'cal', label: '달력' },
  { key: 'timeline', label: '타임라인' },
]

export default function Archive() {
  const [entries, setEntries] = useState(null)
  const [tab, setTab] = useState('grid')
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [detailEntry, setDetailEntry] = useState(null)

  useEffect(() => {
    getAllEntries().then(setEntries)
  }, [])

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
    setSelectedDay(null)
  }
  function switchTab(t) { setTab(t); setSelectedDay(null) }

  return (
    <div className="archive">
      <div className="archive-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`archive-tab${tab === key ? ' active' : ''}`}
            onClick={() => switchTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {entries === null ? (
        <p className="archive-loading">불러오는 중…</p>
      ) : (
        <>
          {tab === 'grid' && <GridView entries={entries} onOpen={setDetailEntry} />}
          {tab === 'cal' && (
            <CalendarView
              entries={entries}
              calYear={calYear}
              calMonth={calMonth}
              selectedDay={selectedDay}
              onPrev={prevMonth}
              onNext={nextMonth}
              onDayClick={d => setSelectedDay(prev => prev === d ? null : d)}
            />
          )}
          {tab === 'timeline' && <TimelineView entries={entries} />}
        </>
      )}

      {detailEntry && <EntryModal entry={detailEntry} onClose={() => setDetailEntry(null)} />}
    </div>
  )
}
