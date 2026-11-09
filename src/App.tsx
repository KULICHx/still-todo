export default function App() {
  return (
    <div className="workspace">
      <header className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Still<span className="brand-accent">.</span>
        </div>
        <p className="sidebar-note">A quiet place to get things done.</p>
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
