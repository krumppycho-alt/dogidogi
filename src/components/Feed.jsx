import { useEffect, useState } from 'react'
import { getAllEntries } from '../lib/storage'
import { getTotalPaws } from '../lib/paws'
import './Feed.css'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  })
}

function EntryCard({ entry }) {
  return (
    <article className="entry-card">
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

export default function Feed({ onRecord }) {
  const [entries, setEntries] = useState(null)
  const [totalPaws, setTotalPaws] = useState(0)

  useEffect(() => {
    getAllEntries().then(setEntries)
    getTotalPaws().then(setTotalPaws)
  }, [])

  return (
    <div className="feed">
      {totalPaws > 0 && (
        <div className="paws-bar">
          <span>🐾</span>
          <span>발자국 {totalPaws}개</span>
        </div>
      )}

      <div className="feed-list">
        {entries === null && <p className="feed-loading">불러오는 중…</p>}

        {entries?.length === 0 && (
          <div className="feed-empty">
            <div className="empty-icon">🐾</div>
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
