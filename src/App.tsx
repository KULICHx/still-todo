import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const themeKey = 'still.theme.v1'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(themeKey)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    return getSystemTheme()
  }
  return getSystemTheme()
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [themeError, setThemeError] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    try {
      localStorage.setItem(themeKey, nextTheme)
      setThemeError(false)
    } catch {
      setThemeError(true)
    }
  }

  return (
    <div className="workspace">
      <header className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Still<span className="brand-accent">.</span>
        </div>
        <div className="sidebar-controls">
          <p className="sidebar-note">A quiet place to get things done.</p>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
          >
            Dark theme
          </button>
          {themeError && (
            <p role="status">Theme preference could not be saved.</p>
          )}
        </div>
      </header>

      <main className="main-panel">
        <header className="page-header">
          <h1>My tasks</h1>
          <p>A little clarity for your day.</p>
        </header>

        <section className="empty-state" aria-labelledby="empty-title">
          <span className="empty-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
              <path
                d="m6 12 4 4 8-8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h2 id="empty-title">No tasks yet</h2>
        </section>
      </main>
    </div>
  )
}
