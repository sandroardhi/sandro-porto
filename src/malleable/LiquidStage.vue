<script setup>
// The fixed glass layer behind every page, plus the SVG filter that makes display type ripple.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createLiquid } from './liquid.js'
import { note } from './diag.js'

const canvas = ref(null)
const fallback = ref(false)
let stop = null

function onLost(e) { e.preventDefault(); if (stop) stop(); stop = null; fallback.value = true; note('context lost: static fallback shown') }

onMounted(() => {
  stop = createLiquid(canvas.value)
  if (!stop) { fallback.value = true; note('createLiquid returned null: static fallback shown') }
  else canvas.value.addEventListener('webglcontextlost', onLost)
})
onBeforeUnmount(() => { if (stop) stop(); canvas.value && canvas.value.removeEventListener('webglcontextlost', onLost) })
</script>

<template>
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="liquid" x="-10%" y="-30%" width="120%" height="160%">
      <feTurbulence id="turb" type="fractalNoise" baseFrequency="0.008 0.022" numOctaves="2" seed="4" result="n" />
      <feDisplacementMap id="disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
  <!-- .gl-wrap is display:contents on desktop; on phones liquid.js turns it into the clip box the canvas rides in -->
  <div class="gl-wrap"><canvas v-show="!fallback" id="gl" ref="canvas" aria-hidden="true"></canvas></div>
  <div v-if="fallback" class="fallback" aria-hidden="true"></div>
</template>
