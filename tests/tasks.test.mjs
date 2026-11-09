import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createTask,
  removeTask,
  selectTasks,
  toggleTaskCompletion,
} from '../src/tasks.ts'

test('adds a trimmed task with the supplied id', () => {
  assert.deepEqual(createTask('  Купить хлеб  ', 'task-1'), {
    id: 'task-1',
    title: 'Купить хлеб',
    completed: false,
  })
})

test('rejects whitespace-only task titles', () => {
  assert.equal(createTask(' \n\t ', 'task-1'), null)
})

test('toggles completion without mutating the original list', () => {
  const tasks = [{ id: 'task-1', title: 'Дело', completed: false }]
  const updated = toggleTaskCompletion(tasks, 'task-1')
  assert.equal(tasks[0].completed, false)
  assert.equal(updated[0].completed, true)
  assert.equal(toggleTaskCompletion(updated, 'task-1')[0].completed, false)
})

test('deletes only the selected task', () => {
  const tasks = [
    { id: 'first', title: 'A', completed: false },
    { id: 'second', title: 'B', completed: false },
  ]
  assert.deepEqual(removeTask(tasks, 'first'), [tasks[1]])
})

test('filters by completion, retaining leaving rows for animation', () => {
  const tasks = [
    { id: 'first', title: 'A', completed: false },
    { id: 'second', title: 'B', completed: true },
  ]
  assert.deepEqual(selectTasks(tasks, null, []), tasks)
  assert.deepEqual(selectTasks(tasks, false, []), [tasks[0]])
  assert.deepEqual(selectTasks(tasks, true, []), [tasks[1]])
  assert.deepEqual(selectTasks(tasks, false, ['second']), tasks)
})
