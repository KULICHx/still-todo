import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { readTasks, saveTasks, TASKS_KEY } from '../src/taskStorage.ts'

function memoryStorage(initial = null) {
  const values = new Map()
  if (initial !== null) values.set(TASKS_KEY, initial)
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values,
  }
}

afterEach(() => {
  delete globalThis.localStorage
})

test('returns an empty list when nothing was saved', () => {
  globalThis.localStorage = memoryStorage()
  assert.deepEqual(readTasks(), {
    tasks: [],
    error: null,
    requiresReset: false,
  })
})

test('loads valid saved tasks', () => {
  const tasks = [{ id: 'first', title: 'Список', completed: false }]
  globalThis.localStorage = memoryStorage(JSON.stringify(tasks))
  assert.deepEqual(readTasks(), {
    tasks,
    error: null,
    requiresReset: false,
  })
})

test('does not overwrite malformed saved data while reading', () => {
  const storage = memoryStorage('{not valid JSON')
  globalThis.localStorage = storage
  const result = readTasks()
  assert.equal(result.requiresReset, true)
  assert.deepEqual(result.tasks, [])
  assert.equal(storage.values.get(TASKS_KEY), '{not valid JSON')
})

test('treats duplicate IDs as unreadable instead of silently accepting them', () => {
  globalThis.localStorage = memoryStorage(
    JSON.stringify([
      { id: 'same', title: 'One', completed: false },
      { id: 'same', title: 'Two', completed: true },
    ]),
  )
  assert.equal(readTasks().requiresReset, true)
})

test('keeps the interface usable if browser storage cannot be read', () => {
  globalThis.localStorage = {
    getItem() {
      throw new Error('blocked')
    },
  }
  const result = readTasks()
  assert.deepEqual(result.tasks, [])
  assert.equal(result.requiresReset, false)
  assert.ok(result.error)
})

test('saves tasks and reports failed writes', () => {
  const storage = memoryStorage()
  globalThis.localStorage = storage
  const tasks = [{ id: 'a', title: 'Задача', completed: true }]
  assert.equal(saveTasks(tasks), true)
  assert.deepEqual(JSON.parse(storage.values.get(TASKS_KEY)), tasks)
  globalThis.localStorage = {
    setItem() {
      throw new Error('quota')
    },
  }
  assert.equal(saveTasks(tasks), false)
})
