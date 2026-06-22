import { useEffect, useState } from 'react'
import './InstallBanner.css'

const DISMISS_KEY = 'dogi_install_dismissed'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const onIOS = isIOS()
    setIos(onIOS)

    if (onIOS) {
      setShow(true)
      return
    }

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="install-banner">
      <div className="install-banner-inner">
        <span className="install-icon">🐾</span>
        <div className="install-text">
          <strong>앱으로 저장하면 더 편해요</strong>
          <span>
            {ios
              ? 'Safari 하단 공유 → 홈 화면에 추가'
              : '오프라인에서도 기록할 수 있어요'}
          </span>
        </div>
        {!ios && (
          <button className="install-add-btn" onClick={install}>추가</button>
        )}
        <button className="install-close" onClick={dismiss} aria-label="닫기">✕</button>
      </div>
    </div>
  )
}
