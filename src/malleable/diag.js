// Hidden WebGL diagnostics: add ?gl to the URL and a small read-out sits over the page.
// liquid.js fills `diag` as it starts and renders; everything here is a no-op without ?gl.
// Extra knobs for narrowing a device problem down: ?gl&steps=60&prism=3&blobs=6&rs=0.5&nloop (nloop=0 turns it off)&px (reads frames back: costs fps)
const q = new URLSearchParams(location.search)
export const diag = q.has('gl') ? { log: [], q } : null

const num = (k) => (q.has(k) && q.get(k) !== '' && isFinite(+q.get(k)) ? +q.get(k) : undefined)
/** Shader / resolution overrides from the URL (only with ?gl). */
export const diagOverrides = diag ? { steps: num('steps'), prism: num('prism'), blobs: num('blobs'), rs: num('rs'),
  loopNormal: q.has('nloop') ? q.get('nloop') !== '0' : undefined } : {}

export function note(msg) {
  if (!diag) return
  const t = (performance.now() / 1000).toFixed(1)
  diag.log.push(`${t}s ${msg}`)
  if (diag.log.length > 14) diag.log.shift()
}

if (diag) {
  addEventListener('error', (e) => note('JS error: ' + (e.message || e.error)))
  addEventListener('unhandledrejection', (e) => note('promise: ' + (e.reason && e.reason.message || e.reason)))
  const box = document.createElement('pre')
  box.style.cssText = 'position:fixed;left:6px;right:6px;bottom:6px;z-index:99999;margin:0;padding:8px;max-height:60vh;overflow:auto;' +
    'background:rgba(0,0,0,.82);color:#9f9;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-all;' +
    'border:1px solid #3a3;border-radius:6px;pointer-events:auto;user-select:text;-webkit-user-select:text'
  const paint = () => {
    const d = diag, f = (v, n = 2) => (typeof v === 'number' ? v.toFixed(n) : v ?? '-')
    box.textContent = [
      `UA ${navigator.userAgent}`,
      `ctx ${d.ctx ?? '-'}  renderer ${d.renderer ?? '-'}  vendor ${d.vendor ?? '-'}`,
      `frag highp ${d.highp ?? '-'}  mediump ${d.mediump ?? '-'}  maxFragUniforms ${d.maxFragUniforms ?? '-'}`,
      `shader ${d.shader ?? '-'}  compile ${f(d.compileMs, 0)}ms  [steps ${d.steps} prism ${d.prism} blobs ${d.blobs} nloop ${d.loopNormal}]`,
      d.shaderLog ? `shader log: ${d.shaderLog}` : '',
      `compact ${d.compact ?? '-'}  ride ${d.ride ?? '-'}  vh ${d.vh ?? '-'}/${innerHeight}  dpr ${devicePixelRatio}  rs ${f(d.rs)}  canvas ${d.cw ?? '-'}x${d.ch ?? '-'}  fps ${f(d.fps, 1)}  worst frame ${f(d.worstMs, 0)}ms`,
      `size ${f(d.sz, 3)}  blobs ${d.drawn ?? '-'}  draws ${d.draws ?? 0}  lost ${d.lost ?? 0}  restored ${d.restored ?? 0}`,
      `pixels: lit ${d.lit ?? '-'}  max ${d.maxLum ?? '-'}  (sampled ${d.sampled ?? 0}x)`,
      ...d.log,
    ].filter(Boolean).join('\n')
  }
  const start = () => { document.body.appendChild(box); paint(); setInterval(paint, 500) }
  document.body ? start() : addEventListener('DOMContentLoaded', start)
}
