import './PostSave.css'

export default function PostSave({ entry, pawsEarned, totalPaws, onDone }) {
  const lines = entry.reply?.split('\n') ?? []

  return (
    <div className="postsave">
      <div className="postsave-dog">🐶</div>

      <div className="reply-bubble">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="paws-reward">
        <span className="paw-icon">🐾</span>
        <span className="paws-earned">+{pawsEarned}</span>
        <span className="paws-total">누적 {totalPaws}개</span>
      </div>

      <div className="teaser">
        <span className="teaser-icon">🗺️</span>
        <p>추억 지도 · 산책 GPS 기록<br /><strong>곧 업데이트</strong>됩니다</p>
      </div>

      <button className="done-btn" onClick={onDone}>
        일기장 보기
      </button>
    </div>
  )
}
