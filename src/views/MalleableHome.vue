<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import projects from '@/projects.json'

const base = import.meta.env.BASE_URL
const work = projects.map((p, i) => ({
  ...p,
  no: String(i + 1).padStart(2, '0'),
  stack: p.techStack.map(t => t.techName).join(' · '),
  img: base + p.projectImg,
}))

const path = [
  { step: 'Where it started', title: 'SMKN 2 Surabaya', text: 'Learned to build for the web, and shipped my first full-stack apps there, like KoKu!, an online canteen for my school.' },
  { step: 'First real team', title: 'Internship', text: 'Code reviews, deadlines, and seeing how other people build things. Picked up habits I still use.' },
  { step: 'On my own', title: 'Sole frontend developer', text: 'Took client sites like Trukmu and Adaboard from design to deploy, owning everything the user sees.' },
  { step: 'Today', title: 'Full-stack', text: 'Vue and Nuxt on the front, Laravel and Supabase on the back. Still learning, still changing shape.' },
]
const tools = ['Vue.js', 'Nuxt.js', 'TypeScript', 'JavaScript', 'Laravel', 'Supabase', 'TailwindCSS', 'HTML', 'CSS']

import portrait from '@/assets/images/profile-pic.jpeg'

const socials = [
  { label: 'WhatsApp', href: 'https://wa.me/6285803967293?text=Hi%20Sandro%2C%20I%20saw%20your%20portfolio%20and%20' },
  { label: 'GitHub', href: 'https://github.com/sandroardhi' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sandro-ardhi-saputra' },
  { label: 'Instagram', href: 'https://www.instagram.com/sandroardhi/' },
]
const year = new Date().getFullYear()

// Hover image reveal for the work list: one floating frame that trails the pointer.
const fine = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches
const active = ref(null)
const shown = computed(() => active.value !== null)
const preview = ref(null)
let raf = 0, px = 0, py = 0, tx = 0, ty = 0, last = 0
const onMove = (e) => { tx = e.clientX; ty = e.clientY }
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now
  const k = 1 - Math.exp(-dt * 10)
  px += (tx - px) * k; py += (ty - py) * k
  if (preview.value) preview.value.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`
  raf = requestAnimationFrame(frame)
}
function enter(i, e) { if (!fine) return; if (active.value === null) { px = tx = e.clientX; py = ty = e.clientY } active.value = i }
function leave() { active.value = null }

// The headline is malleable too: every letter is a variable-font glyph (Anybody: width 50–150,
// weight 100–900) that swells toward the pointer and ripples slowly on its own, like the glass behind it.
const headline = ['I build web apps,', 'end to end.'].map(l => l.split(' ').map(w => [...w]))
const title = ref(null)
function malleableTitle(el) {
  const chars = [...el.querySelectorAll('.ch')]
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const cur = chars.map(() => ({ w: 82, g: 400 }))
  const ptr = { x: 0, y: 0, on: false }
  let id = 0, prev = performance.now(), t = 0, seen = true
  const onP = (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true }
  const off = (e) => { if (!e || e.pointerType !== 'mouse' || e.type === 'pointerleave') ptr.on = false }
  addEventListener('pointermove', onP, { passive: true })
  addEventListener('pointerup', off, { passive: true }); addEventListener('pointercancel', off, { passive: true })
  document.documentElement.addEventListener('pointerleave', off)
  function tick(now) {
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now
    if (reduce.matches || !seen) { id = 0; return }
    t += dt
    // kept subtle: a small reach around the pointer, a gentle swell, slow easing and a slow ripple
    const k = 1 - Math.exp(-dt * 2.5), R = Math.max(70, Math.min(150, innerWidth * 0.09))
    const rects = ptr.on ? chars.map(c => c.getBoundingClientRect()) : null   // read everything, then write
    chars.forEach((c, i) => {
      let f = 0
      if (rects) { const r = rects[i], dx = (r.left + r.width / 2 - ptr.x) / R, dy = (r.top + r.height / 2 - ptr.y) / (R * 0.8); f = Math.exp(-(dx * dx + dy * dy)) }
      const wave = Math.sin(t * 0.5 - i * 0.3)
      cur[i].w += (82 + 30 * f + 4 * wave - cur[i].w) * k
      cur[i].g += (400 + 240 * f + 35 * wave - cur[i].g) * k
      c.style.fontVariationSettings = `"wdth" ${cur[i].w.toFixed(1)}, "wght" ${cur[i].g.toFixed(0)}`
    })
    id = requestAnimationFrame(tick)
  }
  const run = () => { if (!id && seen && !reduce.matches) { prev = performance.now(); id = requestAnimationFrame(tick) } }
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; run() })   // only while the hero is on screen
  io.observe(el); reduce.addEventListener('change', run)
  return () => {
    cancelAnimationFrame(id); io.disconnect(); reduce.removeEventListener('change', run)
    removeEventListener('pointermove', onP); removeEventListener('pointerup', off); removeEventListener('pointercancel', off)
    document.documentElement.removeEventListener('pointerleave', off)
  }
}
let stopTitle = null

onMounted(() => {
  document.title = 'Sandro Ardhi Saputra · Full-stack web developer'
  if (title.value) stopTitle = malleableTitle(title.value)
  if (!fine) return
  addEventListener('pointermove', onMove, { passive: true })
  last = performance.now(); raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('pointermove', onMove); if (stopTitle) stopTitle() })
</script>

<template>
  <main id="top">
    <section class="hero wrap" data-shape="hero">
      <div class="x">
        <span class="kicker rise" style="--d:.5s">Hi, I'm Sandro</span>
        <h1 ref="title" aria-label="I build web apps, end to end.">
          <span v-for="(line, li) in headline" :key="li" class="line" aria-hidden="true"><span class="rise" :style="{ '--d': (.65 + li * .13) + 's' }"><template v-for="(word, wi) in line" :key="wi"><span class="w"><span v-for="(ch, ci) in word" :key="ci" class="ch">{{ ch }}</span></span>{{ wi < line.length - 1 ? ' ' : '' }}</template></span></span>
        </h1>
        <span class="sub rise" style="--d:1s"><span>Malleable while it takes shape.</span> <span>Solid when it ships.</span></span>
      </div>
      <div class="corners x">
        <span class="rise" style="--d:1.2s">Full-stack web developer<br>Vue · Nuxt · TypeScript · Laravel</span>
        <span class="hint rise" style="--d:1.3s">Scroll</span>
        <span class="rise" style="--d:1.2s">Based in Surabaya,<br>Indonesia</span>
      </div>
    </section>

    <section id="how" class="manifesto wrap" data-shape="cat" aria-label="How I work">
      <span class="label">How I work</span>
      <ol class="x">
        <li data-liquid>Learns fast</li>
        <li data-liquid>Adapts</li>
        <li data-liquid>Ships</li>
      </ol>
      <p class="x">New stack, new team, new problem. I take the shape of what the work needs and keep moving.</p>
      <figure class="me">
        <div class="me-photo">
          <img :src="portrait" alt="Sandro Ardhi Saputra" width="416" height="416" loading="lazy" />
        </div>
        <figcaption class="x">
          <span class="label">About me</span>
          <p>A full-stack web developer based in Surabaya, Indonesia. I build with Vue, Nuxt and Laravel, and I care about the details that make something feel good to use.</p>
        </figcaption>
      </figure>
    </section>

    <section id="work" class="work wrap" data-shape="star" aria-label="Selected work">
      <span class="label">Selected work · {{ work.length }} projects</span>
      <ul class="x" @pointerleave="leave">
        <li v-for="(p, i) in work" :key="p.id" data-liquid @pointerenter="enter(i, $event)">
          <RouterLink :to="`/work/${p.id}`">
            <span class="no">{{ p.no }}</span>
            <b>{{ p.projectName }}</b>
            <small>{{ p.stack }}</small>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section id="path" class="path wrap" data-shape="fish" aria-label="Shapes I've taken">
      <span class="label">Shapes I've taken</span>
      <ol class="x">
        <li v-for="(s, i) in path" :key="s.title">
          <span class="no">{{ String(i + 1).padStart(2, '0') }} · {{ s.step }}</span>
          <h3 data-liquid>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
      <div class="tools">
        <span class="label">Works with</span>
        <ul class="x">
          <li v-for="t in tools" :key="t" data-liquid>{{ t }}</li>
        </ul>
      </div>
    </section>

    <section id="contact" class="contact wrap" data-shape="contact" aria-label="Contact">
      <div class="x">
        <h2>Pour me into<br>your next project.</h2>
        <ul class="socials">
          <li v-for="s in socials" :key="s.label"><a :href="s.href" target="_blank" rel="noopener">{{ s.label }}</a></li>
        </ul>
      </div>
      <footer class="foot x">
        <span>© {{ year }} Sandro Ardhi Saputra</span>
        <RouterLink :to="{ path: '/', hash: '#top' }">Back to top</RouterLink>
      </footer>
    </section>

    <div v-if="fine" ref="preview" class="preview" :class="{ on: shown }" aria-hidden="true">
      <img v-for="(p, i) in work" :key="p.id" :src="p.img" alt="" :class="{ on: active === i }" loading="lazy" decoding="async">
    </div>
  </main>
</template>
