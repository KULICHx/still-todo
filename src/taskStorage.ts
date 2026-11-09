import type { Task } from './tasks'

export const TASKS_KEY = 'still.tasks.v1'

type TasksReadResult = {
  tasks: Task[]
  error: string | null
  requiresReset: boolean
}

export function readTasks(): TasksReadResult {
  let raw: string | null

  try {
    raw = localStorage.getItem(TASKS_KEY)
  } catch {
    return {
      tasks: [],
      error: 'Хранилище браузера недоступно. Изменения могут не сохраниться.',
      requiresReset: false,
    }
  }

  if (raw === null) return { tasks: [], error: null, requiresReset: false }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (task): task is Task =>
          typeof task === 'object' &&
          task !== null &&
          typeof task.id === 'string' &&
          typeof task.title === 'string' &&
          task.title.trim().length > 0 &&
          typeof task.completed === 'boolean',
      ) ||
      new Set(parsed.map((task) => task.id)).size !== parsed.length
    ) {
      throw new Error('Invalid tasks')
    }

    return { tasks: parsed, error: null, requiresReset: false }
  } catch {
    return {
      tasks: [],
      error: 'Сохранённые задачи повреждены. Данные не перезаписаны.',
      requiresReset: true,
    }
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}
