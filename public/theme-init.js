;(function () {
  let theme
  try {
    const saved = globalThis.localStorage.getItem('still.theme.v1')
    if (saved === 'dark' || saved === 'light') theme = saved
  } catch {
    theme = undefined
  }
  if (!theme) {
    theme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  globalThis.document.documentElement.dataset.theme = theme
  globalThis.document.querySelector('meta[name="theme-color"]').content =
    theme === 'dark' ? '#19181d' : '#eeebf2'
})()
