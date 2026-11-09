export type Task = {
  id: string
  title: string
  completed: boolean
}

export function createTask(title: string, id: string): Task | null {
  const trimmed = title.trim()
  if (!trimmed) return null
  return { id, title: trimmed, completed: false }
}

export function toggleTaskCompletion(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  )
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

export function selectTasks(
  tasks: Task[],
  status: boolean | null,
  leavingIds: readonly string[],
): Task[] {
  return tasks.filter(
    (task) =>
      leavingIds.includes(task.id) || status === null || task.completed === status,
  )
}
