import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import {
  createTask,
  removeTask,
  selectTasks,
  toggleTaskCompletion,
  type Task,
} from './tasks'
import { readTasks, saveTasks } from './taskStorage'

const filters = ['All tasks', 'Active', 'Completed'] as const
type Filter = (typeof filters)[number]
const filterLabels: Record<Filter, string> = {
  'All tasks': 'Все',
  Active: 'Активные',
  Completed: 'Выполненные',
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
  const [requiresReset, setRequiresReset] = useState(initialTasks.requiresReset)
  const [filter, setFilter] = useState<Filter>('All tasks')
  const [leavingIds, setLeavingIds] = useState<string[]>([])
  const leaveTimers = useRef(new Map<string, number>())
  const completedCount = tasks.filter((task) => task.completed).length
  const visibleTasks = selectTasks(
    tasks,
    filter === 'All tasks' ? null : filter === 'Completed',
    leavingIds,
  )
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)
  const [themeError, setThemeError] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#19181d' : '#eeebf2',
    )
  }, [theme])

  useEffect(() => {
    const timers = leaveTimers.current
    return () => {
      for (const timer of timers.values()) window.clearTimeout(timer)
      timers.clear()
    }
  }, [])

  function cancelLeaving(id: string) {
    const timer = leaveTimers.current.get(id)
    if (timer !== undefined) window.clearTimeout(timer)
    leaveTimers.current.delete(id)
    setLeavingIds((ids) => ids.filter((item) => item !== id))
  }

  function finishLeaving(id: string) {
    cancelLeaving(id)
  }

  function changeFilter(next: Filter) {
    for (const timer of leaveTimers.current.values()) window.clearTimeout(timer)
    leaveTimers.current.clear()
    setLeavingIds([])
    setFilter(next)
  }

  function updateTasks(next: Task[]) {
    setTasks(next)
    setTaskError(saveTasks(next) ? null : 'Не удалось сохранить задачи.')
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requiresReset || !title.trim()) return
    const task = createTask(title, crypto.randomUUID())
    if (!task) return
    updateTasks([task, ...tasks])
    setTitle('')
    changeFilter('All tasks')
  }

  function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    const shouldLeave =
      filter !== 'All tasks' && !task.completed !== (filter === 'Completed')
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    cancelLeaving(id)
    if (shouldLeave && !reducedMotion) {
      setLeavingIds((ids) => [...ids, id])
      leaveTimers.current.set(
        id,
        window.setTimeout(() => finishLeaving(id), 400),
      )
    }

    updateTasks(toggleTaskCompletion(tasks, id))
  }

  function deleteTask(id: string) {
    cancelLeaving(id)
    updateTasks(removeTask(tasks, id))
  }

  function resetUnreadableTasks() {
    if (!saveTasks([])) {
      setTaskError('Не удалось очистить повреждённые данные.')
      return
    }
    setRequiresReset(false)
    setTaskError(null)
    setTasks([])
    setTitle('')
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
      <header className="workspace-header">
        <div className="brand" aria-label="Still">
          <svg
            className="brand-mark"
            viewBox="0 0 112 72"
            aria-hidden="true"
            focusable="false"
          >
            <circle className="brand-mark-dot" cx="17" cy="18" r="16" />
            <rect
              className="brand-mark-top"
              x="43"
              y="9"
              width="68"
              height="19"
              rx="9.5"
            />
            <rect
              className="brand-mark-bottom"
              x="27"
              y="45"
              width="76"
              height="18"
              rx="9"
            />
          </svg>
          <span>Still</span>
        </div>
        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>

      <main className="main-panel">
        <header className="page-header">
          <h1>Список задач</h1>
        </header>
        {themeError && (
          <p className="status-message" role="status">
            Не удалось сохранить выбранную тему.
          </p>
        )}

        <form className="task-form" onSubmit={addTask}>
          <label htmlFor="task-title">Новая задача</label>
          <div className="task-entry">
            <input
              id="task-title"
              value={title}
              maxLength={500}
              disabled={requiresReset}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button type="submit" disabled={!title.trim() || requiresReset}>
              Добавить
            </button>
          </div>
        </form>
        {taskError && (
          <div className="status-message" role="alert">
            <p>{taskError}</p>
            {requiresReset && (
              <>
                <p>Чтобы начать новый список, удалите повреждённые данные.</p>
                <button type="button" onClick={resetUnreadableTasks}>
                  Удалить данные и начать заново
                </button>
              </>
            )}
          </div>
        )}
        <div
          className="task-filters"
          role="group"
          aria-label="Фильтр задач"
          style={{ '--filter-index': filters.indexOf(filter) } as CSSProperties}
        >
          {filters.map((option) => (
            <button
              className="filter-button"
              key={option}
              type="button"
              aria-pressed={filter === option}
              aria-label={
                option === 'Completed' ? filterLabels[option] : undefined
              }
              onClick={() => changeFilter(option)}
            >
              {option === 'Completed' ? (
                <>
                  <span className="filter-label-full">Выполненные</span>
                  <span className="filter-label-compact" aria-hidden="true">
                    Готовые
                  </span>
                </>
              ) : (
                filterLabels[option]
              )}
            </button>
          ))}
        </div>
        {visibleTasks.length > 0 ? (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className={
                  leavingIds.includes(task.id)
                    ? 'task-item task-item-leaving'
                    : 'task-item'
                }
                onAnimationEnd={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    event.animationName === 'task-leave'
                  ) {
                    finishLeaving(task.id)
                  }
                }}
              >
                <div className="task-row">
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
                    aria-label={`Удалить ${task.title}`}
                    title="Удалить задачу"
                    onClick={() => deleteTask(task.id)}
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
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
              {tasks.length === 0 ? 'Задач пока нет' : 'Подходящих задач нет'}
            </h2>
          </section>
        )}
        {tasks.length > 0 && (
          <div className="task-progress">
            <span aria-live="polite">
              Выполнено {completedCount} из {tasks.length}
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
