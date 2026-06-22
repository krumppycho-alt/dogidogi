import { useState } from 'react'
import PawReward from '../animations/PawReward'
import DogSVG from '../animations/DogSVG'
import { getBreed } from '../lib/breeds'
import './PostSave.css'

export default function PostSave({ entry, pawsEarned, totalPaws, onDone }) {
  const [showReward, setShowReward] = useState(true)
  const lines = entry.reply?.split('\n') ?? []

  return (
    <div className="postsave">
      {showReward && (
        <PawReward count={Math.min(pawsEarned, 10)} onDone={() => setShowReward(false)} />
      )}

      <div className="postsave-dog">
        <DogSVG breed={getBreed('mixed')} animation="walking" size={110} />
      </div>

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

      <button className="done-btn" onClick={onDone}>
        일기장 보기
      </button>
    </div>
  )
}
