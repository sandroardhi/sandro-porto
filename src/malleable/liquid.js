// The liquid glass engine: one fixed WebGL canvas that sits behind every page.
// Sections opt in with data-shape="<name>"; as you scroll, the glass melts from one
// section's shape into the next. Elements with data-liquid stir it on hover.
import { vertexShader, fragmentShader } from './shader.js'

const FOC = 1.8, CAMZ = 3.2

// Look settings, tuned in the prototype.
const P = { mat: 1, spread: 1.4, wobble: 1, thick: 0.12, pull: 0.8, drop: 1, speed: 1, shift: 0, hue: 0 }

// x/y are fractions of half-width/half-height; hue in radians.
export const SHAPES = {
  hero:    { s: 0.84, x:  0.00, y:  0.00, hue: 0.0, wob: 1.0,  cat: 0, star: 0, fish: 0 }, // full ring, centred
  cat:     { s: 0.48, x:  0.58, y: -0.02, hue: 0.9, wob: 0.7,  cat: 1, star: 0, fish: 0 }, // a glass cat sitting on the right
  star:    { s: 0.58, x:  0.60, y:  0.18, hue: 2.3, wob: 0.8,  cat: 0, star: 1, fish: 0 }, // a turning star, top right
  fish:    { s: 0.46, x: -0.56, y:  0.00, hue: 4.0, wob: 0.8,  cat: 0, star: 0, fish: 1 }, // a glass fish swimming down, left of the timeline
  contact: { s: 0.95, x:  0.00, y:  0.00, hue: 0.0, wob: 1.25, cat: 0, star: 0, fish: 0 }, // back to the full ring
  corner:  { s: 0.30, x:  0.80, y:  0.50, hue: 1.6, wob: 0.9,  cat: 0, star: 0, fish: 0 }, // case study header
  side:    { s: 0.24, x:  0.92, y: -0.62, hue: 3.2, wob: 0.8,  cat: 0, star: 0, fish: 0 }, // case study body, tucked bottom right, clear of the text
}

// Phones and portrait tablets have no empty side for the glass to sit in, so there each section
// gives it a stage of its own (a .slot element, or the whole section with data-slot="self").
// The shape fills its stage and scrolls with it; as a stage leaves the screen its shape bursts into blobs that
// fly out sideways, and the next stage gathers blobs in from both edges (see stageState). A section without a
// stage just lets the glass leave.
// Keep this query in sync with the .slot media query in malleable.css.
export const COMPACT_QUERY = '(max-width: 899px), (max-aspect-ratio: 9/10)'
const HALF_H = 0.5 * CAMZ / FOC
// rough visual radius of each shape per unit of size, so every shape fills its stage about the same
const REACH = { hero: 1.12, contact: 1.12, corner: 1.12, cat: 1.05, star: 1.0, fish: 1.15 }

const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }
const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4)

// A section's state; on compact screens its size and position come from its stage on screen.
function place(el, compact, fit) {
  const name = el && el.dataset.shape
  const st = { ...(SHAPES[name] || SHAPES.hero) }
  if (!compact) return st
  const slot = el && (el.dataset.slot === 'self' ? el : el.querySelector(':scope > .slot'))
  if (!slot) { st.s = 0; return st }
  const r = slot.getBoundingClientRect(), h = innerHeight
  const rad = (Math.min(r.width, r.height) / h) * HALF_H   // half the stage's short side, in world units
  st.s = rad / (REACH[name] || 1) / fit
  st.x = ((r.left + r.width / 2) / innerWidth) * 2 - 1
  st.y = 1 - ((r.top + r.height / 2) / h) * 2
  return st
}

function targetState(compact = false, fit = 1) {
  const sections = [...document.querySelectorAll('[data-shape]')]
  if (compact) return stageState(sections, fit)
  if (sections.length < 2) return place(sections[0], compact, fit)
  // Each section takes over only once it's really on screen: the shape holds until the next
  // section's top climbs from 70% to 30% of the viewport, then melts across.
  const h = innerHeight
  let pos = 0
  for (let k = 1; k < sections.length; k++) pos += smooth(0.7, 0.3, sections[k].getBoundingClientRect().top / h)
  const i = Math.min(Math.floor(pos), sections.length - 1), m = pos - i
  const a = place(sections[i], compact, fit), b = place(sections[Math.min(sections.length - 1, i + 1)], compact, fit)
  const o = {}
  for (const k in a) o[k] = a[k] + (b[k] - a[k]) * m
  return o
}

// Compact: stages sit one to two screens apart. When a stage is about to scroll off the top, its shape bursts:
// it shrinks away while blobs of the same glass tear off it and fly out past the left and right edges. When the
// next stage rises into view, blobs fly in from both edges, merge, and it swells into its own shape. All of it is
// driven by the scroll, so scrolling back plays it in reverse. Blobs are { x, y, r, k } in world units (k is how
// far they melt into the shape and each other); the shader draws up to MAX_BLOBS.
export const MAX_BLOBS = 12
const BURST_AT = 0.06   // the stage's centre, in viewports from the top, where its shape starts to burst
const lin = (e0, e1, x) => Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
// side, angle on the shape's outline, radius (of the shape's size) and a stagger so they don't move as one
const BLOBS = [
  { side: -1, a: 0.35, r: 0.30, d: 0.00 }, { side: 1, a: -0.3, r: 0.28, d: 0.03 },
  { side: 1, a: 0.75, r: 0.22, d: 0.08 }, { side: -1, a: -0.7, r: 0.24, d: 0.10 },
  { side: -1, a: 0.0, r: 0.17, d: 0.16 }, { side: 1, a: 0.1, r: 0.15, d: 0.20 },
]
function stageState(sections, fit) {
  const h = innerHeight, halfW = HALF_H * innerWidth / h
  let main = null, best = -1, burst = 0, prevAlive = 0
  const blobs = []
  for (const el of sections) {
    const slot = el.dataset.slot === 'self' ? el : el.querySelector(':scope > .slot')
    if (!slot) continue
    const r = slot.getBoundingClientRect()
    const c = (r.top + r.height / 2) / h   // the stage's centre, in viewports from the top
    const out = lin(BURST_AT, BURST_AT - 0.4, c)   // holds until it has risen to the top ~6% of the screen, then bursts on its way off
    const inn = lin(0.95, 0.6, c)          // 0 below the fold, 1 once the blobs have gathered into it
    const alive = 1 - smooth(0, 0.4, out)
    // only one shape is drawn at a time, so a stage waits for the one above to finish bursting before it grows
    const g = alive * smooth(0.35, 0.95, inn) * (1 - prevAlive)
    prevAlive = alive * (inn > 0 ? 1 : 0)
    const st = place(el, true, fit)
    if (g * st.s > best) { best = g * st.s; main = { st, g } }
    const busy = out > 0 && out < 1 ? 'out' : inn > 0 && inn < 1 ? 'in' : null
    if (!busy || blobs.length + BLOBS.length > MAX_BLOBS) continue
    const sw = st.s * fit, X = st.x * halfW
    // a burst lags the scroll: its pieces rise at under half the page's speed, so they stay on screen while they fly
    const Y = busy === 'out' ? st.y * HALF_H + 1.2 * (c - BURST_AT) * HALF_H : st.y * HALF_H
    burst = Math.max(burst, Math.sin(Math.PI * (busy === 'out' ? out : inn)))
    for (const b of BLOBS) {
      const ang = b.side > 0 ? b.a : Math.PI - b.a
      const hx = X + Math.cos(ang) * 0.95 * sw, hy = Y + Math.sin(ang) * 0.95 * sw   // where it sits on the shape
      const ex = b.side * (halfW + 0.9 * sw), ey = Y + Math.sin(ang) * 1.6 * sw         // well past the edge
      let t, rad
      if (busy === 'out') {   // bursts: pulls off the shape, picks up speed, still travelling as it leaves the screen
        t = lin(b.d, b.d + 0.72, out); const e = t * t * (3 - 2 * t)
        rad = b.r * sw * smooth(0, 0.14, t) * (1 - 0.2 * t)
        // it bursts near the top edge, so the pieces also drop a little as they fly, to stay in view on their way out
        const dy = ey - hy - 1.1 * sw * t * t
        blobs.push({ x: hx + (ex - hx) * e, y: hy + dy * e, r: rad, k: Math.min(0.5 * sw, rad * 1.8) })
      } else {                // gathers: flies in, slows as it lands, then melts into the growing shape
        t = lin(b.d, 0.72 + b.d, inn); const e = 1 - (1 - t) * (1 - t)
        rad = b.r * sw * (1 - smooth(0.7, 1, inn))
        blobs.push({ x: ex + (hx - ex) * e, y: ey + (hy - ey) * e, r: rad, k: Math.min(0.5 * sw, rad * 1.8) })
      }
    }
  }
  const st = main ? main.st : { ...SHAPES.hero, s: 0 }   // no stage on this page (yet): nothing to show
  if (main) st.s *= main.g
  st.blobs = blobs.filter(b => b.r > 0.002)
  st.burst = burst
  return st
}

/** Starts the renderer. Returns a stop function, or null when WebGL isn't available. */
export function createLiquid(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)')
  const compactMq = matchMedia(COMPACT_QUERY)

  function sh(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()
  try {
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vertexShader))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fragmentShader(FOC, CAMZ)))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  } catch (e) {
    console.warn('[liquid] shader failed, using the static fallback', e)
    return null
  }
  gl.useProgram(prog)
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = {}
  ;['uRes', 'uTime', 'uMouse', 'uState', 'uHue', 'uWobble', 'uThick', 'uPull', 'uDrop', 'uEnergy', 'uShift', 'uTilt', 'uMat', 'uDisp', 'uCat', 'uStar', 'uFish', 'uP', 'uPN', 'uBound', 'uMinSc']
    .forEach(n => U[n] = gl.getUniformLocation(prog, n))

  // sizing / adaptive quality
  const maxScale = Math.min(window.devicePixelRatio || 1, 1.5)
  // phones start lower and settle up rather than down, so a weak one never opens on a stutter;
  // a device that reports few cores or little memory starts lower still
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3
  const phone = compactMq.matches
  let rs = phone ? Math.min(maxScale, weak ? 0.6 : 1) : maxScale
  function resize() {
    canvas.width = Math.max(1, Math.round(innerWidth * rs)); canvas.height = Math.max(1, Math.round(innerHeight * rs))
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()

  // input
  const halfH = 0.5 * CAMZ / FOC
  let mTarget = [0.55, 0.35], mNow = [0.55, 0.35], mPrev = [0, 0], mSpeed = 0
  let tilt = [0, 0], hoverBoost = 0
  const onMove = (e) => {
    const uvx = (e.clientX - innerWidth / 2) / innerHeight, uvy = -(e.clientY - innerHeight / 2) / innerHeight
    mTarget = [uvx * 2 * halfH, uvy * 2 * halfH]
  }
  const onOver = (e) => { hoverBoost = e.target.closest && e.target.closest('[data-liquid]') ? 1 : 0 }
  // touch has no hover, so a tap stirs the glass instead: it pulls toward the finger and splashes
  let splash = 0
  const onDown = (e) => { if (e.pointerType === 'mouse') return; onMove(e); splash = 1 }
  addEventListener('resize', resize)
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })

  // loop
  const fitFor = () => Math.min(1, (innerWidth / innerHeight) * 1.12)
  const { blobs: _b, burst: _u, ...cur } = targetState(compactMq.matches, fitFor())
  let time = 0, last = performance.now(), energy = 0, frames = 0, acc = 0, raf = 0
  let lastY = scrollY, sVel = 0, lastDisp = -1, wasEmpty = false
  const t0 = performance.now()

  function frame(now) {
    const reduce = reduceMq.matches
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    const k = (rate) => 1 - Math.exp(-dt * rate)

    // scroll velocity (px/s), smoothed; capped so a page change is a splash, not a flood
    const y = scrollY; const v = Math.max(-6000, Math.min(6000, (y - lastY) / Math.max(dt, 1e-3))); lastY = y
    sVel += (v - sVel) * k(6)

    mNow[0] += (mTarget[0] - mNow[0]) * k(7); mNow[1] += (mTarget[1] - mNow[1]) * k(7)
    const md = Math.hypot(mNow[0] - mPrev[0], mNow[1] - mPrev[1]) / Math.max(dt, 1e-3); mPrev = [...mNow]
    mSpeed += (md - mSpeed) * k(5)

    splash += (0 - splash) * k(1.6)
    const compact = compactMq.matches
    const aspect = innerWidth / innerHeight, halfW = halfH * aspect
    const fit = fitFor()
    const tgt = targetState(compact, fit)

    const eTarget = reduce ? 0 : Math.min(1, Math.abs(sVel) / 2500 + mSpeed * 0.12 + hoverBoost * 0.35 + splash * 0.6 + (compact ? 0.4 * (tgt.burst || 0) : 0))
    energy += (eTarget - energy) * k(eTarget > energy ? 8 : 2)

    const intro = reduce ? 1 : easeOut((now - t0) / 2200) // the ring pours in over ~2s
    // on compact screens the glass rides its stage, so place and size follow the scroll closely
    // (its position is glued to the stage outright, so a hand-off never shows the shape sliding across)
    const rate = (key) => key === 'cat' || key === 'star' || key === 'fish' ? 2.4 : compact && (key === 'x' || key === 'y') ? 1e3 : compact && key === 's' ? 10 : 3.0
    for (const key in cur) cur[key] += (tgt[key] - cur[key]) * k(rate(key))
    const blobs = compact ? tgt.blobs : []

    tilt[0] += ((reduce ? 0 : mNow[0] * 0.18) - tilt[0]) * k(3)
    tilt[1] += ((reduce ? 0 : -mNow[1] * 0.18 + Math.max(-0.5, Math.min(0.5, sVel / 6000))) - tilt[1]) * k(3)

    time += dt * P.speed * (reduce ? 0.25 : 1) * (1 + energy * 1.2)

    // adaptive resolution (before drawing: resizing clears the canvas)
    // compact screens check twice as often and step down harder, so a slow phone recovers within a second
    frames++; acc += dt
    if (acc > (compact ? 0.5 : 1)) {
      const fps = frames / acc, floor = compact ? 0.4 : 0.5
      if (fps < 45 && rs > floor) { rs = Math.max(floor, rs * (compact ? 0.78 : 0.85)); resize() }
      else if (fps > 58 && rs < maxScale) { rs = Math.min(maxScale, rs * 1.08); resize() }
      frames = 0; acc = 0
    }

    const sz = cur.s * fit * (0.18 + 0.82 * intro)
    const room = Math.max(0, halfW - sz * 1.02) // keep a small off-centre shape fully on screen
    gl.uniform2f(U.uRes, canvas.width, canvas.height)
    gl.uniform1f(U.uTime, time)
    gl.uniform2f(U.uMouse, mNow[0], mNow[1])
    const ox = Math.max(-room, Math.min(room, cur.x * halfW)), oy = cur.y * halfH
    gl.uniform3f(U.uState, sz, ox, oy)
    // blobs (compact only), in world units; the ray's bounding sphere has to take them in too
    const br = (1.3 + 0.4 * cur.fish) * sz + 0.05   // the shape's own bound (the fish is the longest)
    let x0 = ox - br, x1 = ox + br, y0 = oy - br, y1 = oy + br
    const pv = new Float32Array(MAX_BLOBS * 4)
    blobs.forEach((b, i) => {
      pv.set([b.x, b.y, b.r, b.k], i * 4)
      const pad = b.r * 1.3 + 0.03
      x0 = Math.min(x0, b.x - pad); x1 = Math.max(x1, b.x + pad); y0 = Math.min(y0, b.y - pad); y1 = Math.max(y1, b.y + pad)
    })
    const drawn = blobs.length
    gl.uniform4fv(U.uP, pv); gl.uniform1f(U.uPN, drawn)
    if (drawn) gl.uniform3f(U.uBound, (x0 + x1) / 2, (y0 + y1) / 2, Math.hypot(x1 - x0, y1 - y0) / 2)
    else gl.uniform3f(U.uBound, ox, oy, br)
    gl.uniform1f(U.uMinSc, drawn ? 0.35 : 0)
    gl.uniform1f(U.uHue, cur.hue + P.hue)
    gl.uniform1f(U.uWobble, cur.wob * P.wobble * (1 + (1 - intro) * 2.5))
    gl.uniform1f(U.uThick, P.thick)
    gl.uniform1f(U.uPull, P.pull)
    gl.uniform1f(U.uDrop, P.drop)
    gl.uniform1f(U.uEnergy, Math.min(1, energy + (1 - intro) * 0.8))
    gl.uniform1f(U.uShift, P.shift)
    gl.uniform2f(U.uTilt, tilt[0], tilt[1])
    gl.uniform1f(U.uMat, P.mat)
    gl.uniform1f(U.uDisp, P.spread * (1 - 0.45 * Math.max(cur.cat, cur.fish))) // calm the split light so solid shapes stay glassy
    gl.uniform1f(U.uCat, cur.cat)
    gl.uniform1f(U.uStar, cur.star)
    gl.uniform1f(U.uFish, cur.fish)
    // nothing on screen (between stages on a phone): one black frame, then skip the draws until something comes back
    const empty = !drawn && sz < 2e-3
    if (!empty || !wasEmpty) gl.drawArrays(gl.TRIANGLES, 0, 3)
    wasEmpty = empty

    // liquid text: the SVG filter's displacement follows scroll/hover energy
    const disp = document.getElementById('disp'), turb = document.getElementById('turb')
    const ds = reduce ? 0 : Math.round(energy * 28)
    if (disp && ds !== lastDisp) { disp.setAttribute('scale', ds); lastDisp = ds }
    if (turb && !reduce && ds > 0) turb.setAttribute('baseFrequency', (0.008 + 0.002 * Math.sin(time * 0.7)).toFixed(4) + ' ' + (0.022 + 0.004 * Math.cos(time * 0.5)).toFixed(4))

    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return function stop() {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    removeEventListener('pointermove', onMove)
    removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerover', onOver)
  }
}
