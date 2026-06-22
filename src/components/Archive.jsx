import { useEffect, useState, useCallback } from 'react'
import { getAllEntries, getTrashEntries, updateEntry, deleteEntry, restoreEntry, permanentlyDelete } from '../lib/storage'
import './Archive.css'

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}
function fmtShort(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}.${d.getDate()}`
}
function isWalkEntry(e) {
  return e.text?.startsWith('[산책]') || !!e.walkData
}

function EntryCard({ entry, onOpen }) {
  const walk = isWalkEntry(entry)
  return (
    <article className={`entry-card${entry.photo ? '' : ' no-photo'}${walk ? ' walk-card' : ''}`} onClick={() => onOpen(entry)}>
      {entry.photo && (
        <div className="card-photo">
          <img src={entry.photo} alt="" loading="lazy" />
        </div>
      )}
      <div className="card-body">
        <time className="card-date">{fmtDate(entry.created_at)}{walk ? ' 🐾 산책' : ''}</time>
        <p className="card-text">{entry.text}</p>
        {entry.reply && (
          <div className="card-reply">
            <span className="reply-dog">🐶</span>
            <p>{entry.reply.split('\n')[0]}</p>
          </div>
        )}
        {entry.activities?.length > 0 && (
          <div className="card-activities">
            {entry.activities.map((a, i) => <span key={i} className="act-chip">{a.emoji} {a.label}</span>)}
          </div>
        )}
      </div>
    </article>
  )
}

function GridView({ entries, onOpen }) {
  if (!entries.length) return <div className="archive-empty"><span>🐾</span><p>아직 기록이 없어요</p></div>

  const byDate = {}
  entries.forEach(e => {
    const k = localDateKey(new Date(e.created_at))
    if (!byDate[k]) byDate[k] = []
    byDate[k].push(e)
  })

  return (
    <div className="grid-groups">
      {Object.entries(byDate).map(([dateKey, dayEntries]) => (
        <div key={dateKey} className="grid-group">
          <div className="grid-group-label">{fmtDate(dayEntries[0].created_at)}</div>
          <div className="grid-wrap">
            {dayEntries.map(e => (
              <div
                key={e.id}
                className={`grid-cell${e.photo ? '' : ' grid-text-cell'}${isWalkEntry(e) ? ' grid-walk-cell' : ''}`}
                onClick={() => onOpen(e)}
              >
                {e.photo ? (
                  <>
                    <img src={e.photo} alt="" loading="lazy" />
                    <div className="grid-overlay">{fmtShort(e.created_at)}</div>
                  </>
                ) : (
                  <>
                    {isWalkEntry(e) && <span className="grid-walk-icon">🐾</span>}
                    <p className="grid-cell-text">{e.text}</p>
                    <span className="grid-cell-date">{fmtShort(e.created_at)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CalendarView({ entries, calYear, calMonth, selectedDay, onPrev, onNext, onDayClick, onOpen }) {
  const byDate = {}
  entries.forEach(e => {
    const k = localDateKey(new Date(e.created_at))
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
        {['월','화','수','목','금','토','일'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} className="cal-day" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const dk = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const has = !!byDate[dk]
          const hasWalk = byDate[dk]?.some(isWalkEntry)
          const cls = ['cal-day', has ? 'has-entry' : '', isNowMonth && d === now.getDate() ? 'today' : '', selectedDay === d ? 'selected' : ''].filter(Boolean).join(' ')
          return (
            <div key={d} className={cls} onClick={has ? () => onDayClick(d) : undefined}>
              <span>{d}</span>
              {has && <div className={`entry-dot${hasWalk ? ' walk-dot' : ''}`} />}
            </div>
          )
        })}
      </div>
      {selectedDay != null && (
        <div className="cal-detail">
          <p className="cal-detail-label">
            {new Date(calYear, calMonth, selectedDay).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          {selEntries.map(e => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  )
}

function TimelineView({ entries, onOpen }) {
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
            {m.entries.map(e => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrashView({ entries, onRestore, onDelete }) {
  if (!entries.length) return <div className="archive-empty"><span>🗑</span><p>휴지통이 비어 있어요</p></div>
  return (
    <div className="trash-wrap">
      <p className="trash-hint">30일 후 자동으로 영구 삭제됩니다</p>
      {entries.map(e => (
        <div key={e.id} className="trash-item">
          <div className="trash-item-body">
            <time className="card-date">{fmtDate(e.created_at)}</time>
            <p className="card-text">{e.text?.slice(0, 80)}{e.text?.length > 80 ? '…' : ''}</p>
          </div>
          <div className="trash-actions">
            <button className="trash-restore-btn" onClick={() => onRestore(e.id)}>복원</button>
            <button className="trash-delete-btn" onClick={() => onDelete(e.id)}>영구삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryModal({ entry, onClose, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(entry.text)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleSave() {
    setSaving(true)
    const updated = await updateEntry(entry.id, { text: editText })
    setSaving(false)
    setEditing(false)
    onUpdated?.(updated)
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    await deleteEntry(entry.id)
    onDeleted?.(entry.id)
    onClose()
  }

  return (
    <div className="entry-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="modal-header-actions">
            {!editing && (
              <button className="modal-edit-btn" onClick={() => { setEditing(true); setEditText(entry.text) }}>수정</button>
            )}
            <button
              className={`modal-delete-btn${confirming ? ' confirm' : ''}`}
              onClick={handleDelete}
            >
              {confirming ? '정말 삭제?' : '삭제'}
            </button>
          </div>
        </div>
        {entry.photo && (
          <div className="modal-photo">
            <img src={entry.photo} alt="" loading="lazy" />
          </div>
        )}
        <div className="modal-body">
          <time className="card-date">{fmtDate(entry.created_at)}{isWalkEntry(entry) ? ' 🐾 산책' : ''}</time>
          {editing ? (
            <div className="modal-edit-area">
              <textarea
                className="modal-edit-input"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <div className="modal-edit-actions">
                <button className="modal-cancel-btn" onClick={() => setEditing(false)}>취소</button>
                <button className="modal-save-btn" onClick={handleSave} disabled={saving || !editText.trim()}>
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <p className="card-text">{entry.text}</p>
          )}
          {entry.activities?.length > 0 && (
            <div className="card-activities" style={{ marginTop: 8 }}>
              {entry.activities.map((a, i) => <span key={i} className="act-chip">{a.emoji} {a.label}</span>)}
            </div>
          )}
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
  { key: 'trash', label: '🗑 휴지통' },
]

export default function Archive() {
  const [entries, setEntries] = useState(null)
  const [trashEntries, setTrashEntries] = useState([])
  const [tab, setTab] = useState('grid')
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [detailEntry, setDetailEntry] = useState(null)

  const loadEntries = useCallback(() => {
    getAllEntries().then(setEntries)
    getTrashEntries().then(setTrashEntries)
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

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

  function handleDeleted(id) {
    setEntries(prev => prev?.filter(e => e.id !== id) ?? [])
    getTrashEntries().then(setTrashEntries)
  }

  function handleUpdated(updated) {
    setEntries(prev => prev?.map(e => e.id === updated.id ? updated : e) ?? [])
    if (detailEntry?.id === updated.id) setDetailEntry(updated)
  }

  async function handleRestore(id) {
    await restoreEntry(id)
    loadEntries()
  }

  async function handlePermanentDelete(id) {
    if (!window.confirm('영구 삭제하면 복원할 수 없어요. 계속할까요?')) return
    await permanentlyDelete(id)
    setTrashEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="archive">
      <div className="archive-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`archive-tab${tab === key ? ' active' : ''}${key === 'trash' ? ' trash-tab' : ''}`}
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
              onOpen={setDetailEntry}
            />
          )}
          {tab === 'timeline' && <TimelineView entries={entries} onOpen={setDetailEntry} />}
          {tab === 'trash' && (
            <TrashView
              entries={trashEntries}
              onRestore={handleRestore}
              onDelete={handlePermanentDelete}
            />
          )}
        </>
      )}

      {detailEntry && (
        <EntryModal
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
