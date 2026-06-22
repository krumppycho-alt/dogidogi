import { useRef, useState } from 'react'
import { resizeImage } from '../lib/imageUtils'
import { saveEntry } from '../lib/storage'
import { generateReply } from '../lib/reply'
import { calcPaws, addPaws } from '../lib/paws'
import { syncEntry } from '../lib/sync'
import DogSVG from '../animations/DogSVG'
import { getBreed } from '../lib/breeds'
import './RecordForm.css'

export default function RecordForm({ onSaved }) {
  const [photo, setPhoto] = useState(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(await resizeImage(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)

    const reply = await generateReply(text.trim())
    const draft = { text: text.trim(), photo, reply }
    const paws  = calcPaws(draft)
    const totalPaws = await addPaws(paws)
    const saved = await saveEntry({ ...draft, paws })

    syncEntry(saved)   // fire-and-forget

    setSaving(false)
    setText('')
    setPhoto(null)
    onSaved?.(saved, paws, totalPaws)
  }

  const canSubmit = text.trim().length > 0 && !saving

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div
        className={`photo-area ${photo ? 'has-photo' : ''}`}
        onClick={() => fileRef.current.click()}
      >
        {photo
          ? <img src={photo} alt="오늘 사진" />
          : (
            <div className="photo-placeholder">
              <span className="photo-icon">🐾</span>
              <span>사진 추가</span>
            </div>
          )
        }
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          hidden
        />
      </div>

      <textarea
        className="text-input"
        placeholder="오늘 도기는 어떤 하루였나요? (2~3줄)"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        maxLength={300}
      />
      <div className="char-count">{text.trim().length} / 300</div>

      {saving ? (
        <div className="saving-dog">
          <DogSVG breed={getBreed('mixed')} animation="thinking" size={72} />
          <div className="think-dots">
            <span className="think-dot">•</span>
            <span className="think-dot">•</span>
            <span className="think-dot">•</span>
          </div>
        </div>
      ) : (
        <button className="submit-btn" type="submit" disabled={!canSubmit}>
          기록하기
        </button>
      )}
    </form>
  )
}
