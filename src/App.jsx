import { useState } from 'react'
import Feed from './components/Feed'
import RecordForm from './components/RecordForm'
import PostSave from './components/PostSave'
import Archive from './components/Archive'
import WalkTab from './components/WalkTab'
import InstallBanner from './components/InstallBanner'
import './App.css'

export default function App() {
  // page: 'feed' | 'record' | 'postsave' | 'archive' | 'walk'
  const [page, setPage] = useState('feed')
  const [saveResult, setSaveResult] = useState(null)
  const [feedKey, setFeedKey] = useState(0)

  function handleSaved(entry, pawsEarned, totalPaws) {
    setSaveResult({ entry, pawsEarned, totalPaws })
    setPage('postsave')
  }

  function handleDone() {
    setFeedKey(k => k + 1)
    setSaveResult(null)
    setPage('feed')
  }

  const showBack = page === 'record'
  const showNav = page === 'feed' || page === 'archive' || page === 'walk'

  return (
    <div className="app">
      <InstallBanner />

      <header className="app-header">
        {showBack
          ? <button className="back-btn" onClick={() => setPage('feed')}>‹</button>
          : <div className="header-spacer" />
        }
        <div className="app-title-group">
          <span className="app-paw">🐾</span>
          <h1 className="app-title">도기도기</h1>
        </div>
        <div className="header-spacer" />
      </header>

      <main className="app-main">
        {page === 'feed' && (
          <Feed onRecord={() => setPage('record')} key={feedKey} />
        )}
        {page === 'record' && (
          <RecordForm onSaved={handleSaved} />
        )}
        {page === 'postsave' && saveResult && (
          <PostSave
            entry={saveResult.entry}
            pawsEarned={saveResult.pawsEarned}
            totalPaws={saveResult.totalPaws}
            onDone={handleDone}
          />
        )}
        {page === 'archive' && <Archive key={page} />}
        {page === 'walk' && <WalkTab />}
      </main>

      {showNav && (
        <nav className="bottom-nav">
          <button
            className={page === 'feed' ? 'active' : ''}
            onClick={() => setPage('feed')}
          >
            🏠<br /><span>홈</span>
          </button>
          <button
            className={page === 'walk' ? 'active' : ''}
            onClick={() => setPage('walk')}
          >
            🐾<br /><span>산책</span>
          </button>
          <button
            className={page === 'archive' ? 'active' : ''}
            onClick={() => setPage('archive')}
          >
            📖<br /><span>추억</span>
          </button>
        </nav>
      )}
    </div>
  )
}
