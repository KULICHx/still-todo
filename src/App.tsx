import { useEffect, useState, type FormEvent } from 'react'
import type { Task } from './tasks'
import { readTasks, saveTasks } from './taskStorage'

const filters = ['all', 'active', 'completed'] as const
type Filter = (typeof filters)[number]

const filterLabels = {
  all: 'Все',
  active: 'Активные',
  completed: 'Выполненные',
}
const emptyMessages = {
  all: ['Задач пока нет', 'Добавьте первую задачу в поле выше.'],
  active: ['Активных задач нет', 'Новые задачи появятся здесь.'],
  completed: [
    'Выполненных задач пока нет',
    'Отметьте задачу, и она появится здесь.',
  ],
}

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
  const [filter, setFilter] = useState<Filter>('all')
  const completedCount = tasks.filter((task) => task.completed).length
  const remainingCount = tasks.length - completedCount
  const visibleTasks = tasks.filter(
    (task) => filter === 'all' || task.completed === (filter === 'completed'),
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
      saveTasks(next) ? null : 'Не удалось сохранить задачи в браузере.',
    )
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const task = { id: crypto.randomUUID(), title: trimmed, completed: false }
    updateTasks([task, ...tasks])
    setTitle('')
    setFilter('all')
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
      <main className="main-panel">
        <header className="page-header">
          <h1>Список задач</h1>
          <button
            className="theme-toggle"
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
          >
            Тёмная тема
          </button>
        </header>
        {themeError && <p role="status">Не удалось сохранить тему.</p>}
        <form className="task-form" onSubmit={addTask}>
          <label htmlFor="task-title">Новая задача</label>
          <div className="task-entry">
            <input
              id="task-title"
              value={title}
              maxLength={500}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button type="submit" disabled={!title.trim()}>
              Добавить
            </button>
          </div>
        </form>
        {taskError && <p role="alert">{taskError}</p>}
        <div className="task-filters" role="group" aria-label="Фильтр задач">
          {filters.map((option) => (
            <button
              className="filter-button"
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {filterLabels[option]}
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
                  aria-label={`Удалить: ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <section className="empty-state" aria-labelledby="empty-title">
            <h2 id="empty-title">{emptyMessages[filter][0]}</h2>
            <p>{emptyMessages[filter][1]}</p>
          </section>
        )}
        {tasks.length > 0 && (
          <div className="task-progress">
            <span aria-live="polite">
              Осталось: {remainingCount} · Выполнено: {completedCount}
            </span>
            <progress
              aria-label="Выполнение задач"
              value={completedCount}
              max={tasks.length}
            />
          </div>
        )}
      </main>
    </div>
  )
}
