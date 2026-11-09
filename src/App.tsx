import { useEffect, useState, type FormEvent } from 'react'
import type { Task } from './tasks'
import { readTasks, saveTasks } from './taskStorage'

const filters = ['All tasks', 'Active', 'Completed'] as const
type Filter = (typeof filters)[number]

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
  const [initialTasks] = useState(readTasks)
  const [tasks, setTasks] = useState(initialTasks.tasks)
  const [taskError, setTaskError] = useState(initialTasks.error)
  const [filter, setFilter] = useState<Filter>('All tasks')
  const completedCount = tasks.filter((task) => task.completed).length
  const remainingCount = tasks.length - completedCount
  const visibleTasks = tasks.filter(
    (task) =>
      filter === 'All tasks' || task.completed === (filter === 'Completed'),
  )
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)
  const [themeError, setThemeError] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function updateTasks(next: Task[]) {
    setTasks(next)
    setTaskError(
      saveTasks(next) ? null : 'Tasks could not be saved in this browser.',
    )
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const task = { id: crypto.randomUUID(), title: trimmed, completed: false }
    updateTasks([task, ...tasks])
    setTitle('')
    setFilter('All tasks')
  }

  function toggleTask(id: string) {
    updateTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(id: string) {
    updateTasks(tasks.filter((task) => task.id !== id))
  }

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

        <form className="task-form" onSubmit={addTask}>
          <label htmlFor="task-title">New task</label>
          <div className="task-entry">
            <input
              id="task-title"
              value={title}
              maxLength={500}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button type="submit" disabled={!title.trim()}>
              Add task
            </button>
          </div>
        </form>
        {taskError && <p role="alert">{taskError}</p>}
        <div className="task-filters" role="group" aria-label="Filter tasks">
          {filters.map((option) => (
            <button
              className="theme-toggle"
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {visibleTasks.length > 0 ? (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className="task-row">
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span>{task.title}</span>
                </label>
                <button
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
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
            <h2 id="empty-title">
              {tasks.length === 0
                ? 'No tasks yet'
                : 'No tasks match this filter'}
            </h2>
          </section>
        )}
        {tasks.length > 0 && (
          <div className="task-progress">
            <span aria-live="polite">
              {remainingCount} remaining · {completedCount} completed
            </span>
            <progress
              aria-label="Tasks completed"
              value={completedCount}
              max={tasks.length}
            />
          </div>
        )}
      </main>
    </div>
  )
}
