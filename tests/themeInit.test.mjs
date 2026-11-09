import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8')

function runThemeInit(saved, systemDark) {
  const root = { dataset: {} }
  const themeColor = { content: '' }
  runInNewContext(source, {
    localStorage: {
      getItem() {
        if (saved instanceof Error) throw saved
        return saved
      },
    },
    matchMedia: () => ({ matches: systemDark }),
    document: {
      documentElement: root,
      querySelector: () => themeColor,
    },
  })
  return { theme: root.dataset.theme, color: themeColor.content }
}

test('uses the saved light theme before rendering', () => {
  assert.deepEqual(runThemeInit('light', true), {
    theme: 'light',
    color: '#eeebf2',
  })
})

test('uses the saved dark theme before rendering', () => {
  assert.deepEqual(runThemeInit('dark', false), {
    theme: 'dark',
    color: '#19181d',
  })
})

test('falls back to the system preference for missing or invalid settings', () => {
  assert.equal(runThemeInit(null, true).theme, 'dark')
  assert.equal(runThemeInit('invalid', false).theme, 'light')
})

test('remains usable when localStorage is unavailable', () => {
  assert.equal(runThemeInit(new Error('blocked'), true).theme, 'dark')
})
