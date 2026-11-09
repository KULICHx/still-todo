import type { Task } from './tasks'
export const TASKS_KEY = 'still.tasks.v1'
export function readTasks(): { tasks: Task[]; error: string | null } {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return { tasks: [], error: null }
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
    )
      throw new Error('Invalid tasks')
    return { tasks: parsed, error: null }
  } catch {
    return {
      tasks: [],
      error:
        'Saved tasks could not be read. Adding a new task will start a new list.',
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
