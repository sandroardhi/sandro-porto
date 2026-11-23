<script setup>
// A small exclusion dot that trails the pointer and swells over anything you can act on. Fine pointers only.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const el = ref(null)
const enabled = ref(typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches)
let raf = 0, x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, last = 0

const onMove = (e) => { tx = e.clientX; ty = e.clientY }
const onOver = (e) => {
  const hit = e.target.closest && e.target.closest('a, button, [data-liquid]')
  el.value && el.value.classList.toggle('big', !!hit)
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now
  const k = 1 - Math.exp(-dt * 18)
  x += (tx - x) * k; y += (ty - y) * k
  if (el.value) el.value.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  if (!enabled.value) return
  document.documentElement.classList.add('has-cursor')
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })
  last = performance.now(); raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerover', onOver)
  document.documentElement.classList.remove('has-cursor')
})
</script>

<template>
  <div v-if="enabled" ref="el" class="cursor" aria-hidden="true"></div>
</template>
