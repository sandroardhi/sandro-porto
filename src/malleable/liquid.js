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

const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }
const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4)

function targetState() {
  const sections = [...document.querySelectorAll('[data-shape]')]
  const shape = (el) => SHAPES[el && el.dataset.shape] || SHAPES.hero
  if (sections.length < 2) return { ...shape(sections[0]) }
  // Each section takes over only once it's really on screen: the shape holds until the next
  // section's top climbs from 70% to 30% of the viewport, then melts across.
  const h = innerHeight
  let pos = 0
  for (let k = 1; k < sections.length; k++) pos += smooth(0.7, 0.3, sections[k].getBoundingClientRect().top / h)
  const i = Math.min(Math.floor(pos), sections.length - 1), m = pos - i
  const a = shape(sections[i]), b = shape(sections[Math.min(sections.length - 1, i + 1)])
  const o = {}
  for (const k in a) o[k] = a[k] + (b[k] - a[k]) * m
  return o
}

/** Starts the renderer. Returns a stop function, or null when WebGL isn't available. */
export function createLiquid(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)')

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
  ;['uRes', 'uTime', 'uMouse', 'uState', 'uHue', 'uWobble', 'uThick', 'uPull', 'uDrop', 'uEnergy', 'uShift', 'uTilt', 'uMat', 'uDisp', 'uCat', 'uStar', 'uFish']
    .forEach(n => U[n] = gl.getUniformLocation(prog, n))

  // sizing / adaptive quality
  const maxScale = Math.min(window.devicePixelRatio || 1, 1.5)
  let rs = maxScale
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
  addEventListener('resize', resize)
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })

  // loop
  const cur = { ...targetState() }
  let time = 0, last = performance.now(), energy = 0, frames = 0, acc = 0, raf = 0
  let lastY = scrollY, sVel = 0, lastDisp = -1
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

    const eTarget = reduce ? 0 : Math.min(1, Math.abs(sVel) / 2500 + mSpeed * 0.12 + hoverBoost * 0.35)
    energy += (eTarget - energy) * k(eTarget > energy ? 8 : 2)

    const intro = reduce ? 1 : easeOut((now - t0) / 2200) // the ring pours in over ~2s

    const tgt = targetState()
    for (const key in cur) cur[key] += (tgt[key] - cur[key]) * k(key === 'cat' || key === 'star' || key === 'fish' ? 2.4 : 3.0)
    const aspect = innerWidth / innerHeight, halfW = halfH * aspect
    const fit = Math.min(1, aspect * 1.12)

    tilt[0] += ((reduce ? 0 : mNow[0] * 0.18) - tilt[0]) * k(3)
    tilt[1] += ((reduce ? 0 : -mNow[1] * 0.18 + Math.max(-0.5, Math.min(0.5, sVel / 6000))) - tilt[1]) * k(3)

    time += dt * P.speed * (reduce ? 0.25 : 1) * (1 + energy * 1.2)

    // adaptive resolution (before drawing: resizing clears the canvas)
    frames++; acc += dt
    if (acc > 1) {
      const fps = frames / acc
      if (fps < 45 && rs > 0.5) { rs = Math.max(0.5, rs * 0.85); resize() }
      else if (fps > 58 && rs < maxScale) { rs = Math.min(maxScale, rs * 1.08); resize() }
      frames = 0; acc = 0
    }

    const sz = cur.s * fit * (0.18 + 0.82 * intro)
    const room = Math.max(0, halfW - sz * 1.02) // keep a small off-centre shape fully on screen
    gl.uniform2f(U.uRes, canvas.width, canvas.height)
    gl.uniform1f(U.uTime, time)
    gl.uniform2f(U.uMouse, mNow[0], mNow[1])
    gl.uniform3f(U.uState, sz, Math.max(-room, Math.min(room, cur.x * halfW)), cur.y * halfH)
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
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // liquid text: the SVG filter's displacement follows scroll/hover energy
    const disp = document.getElementById('disp'), turb = document.getElementById('turb')
    const ds = reduce ? 0 : Math.round(energy * 28)
    if (disp && ds !== lastDisp) { disp.setAttribute('scale', ds); lastDisp = ds }
    if (turb && !reduce) turb.setAttribute('baseFrequency', (0.008 + 0.002 * Math.sin(time * 0.7)).toFixed(4) + ' ' + (0.022 + 0.004 * Math.cos(time * 0.5)).toFixed(4))

    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return function stop() {
    cancelAnimationFrame(raf)
    removeEventListener('resize', resize)
    removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerover', onOver)
  }
}
