// The loading screen lives in index.html so it paints before any JavaScript runs; its inline script owns the
// counter and the exit (window.__loader). These helpers report progress to it. Both are safe to call any time.

/** A real milestone, 0..1. The counter never goes backwards. */
export function setProgress(p) {
  if (window.__loader) window.__loader.set(p)
}

/** The page is ready: the counter runs to 100 and the sheet lifts away, then the intro plays. */
export function hideLoader() {
  if (window.__loader) { window.__loader.done(); return }
  // no inline script (shouldn't happen): just get out of the way
  document.documentElement.classList.remove('is-loading')
  const el = document.getElementById('loader')
  if (el) el.remove()
}
