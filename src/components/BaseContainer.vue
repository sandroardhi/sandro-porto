<template>
  <main
    data-scroll-container
    class="w-full relative min-h-screen bg-black overflow-x-hidden"
  >
    <slot></slot>
  </main>
</template>

<script setup>
import Lenis from "@studio-freight/lenis";

const lenis = new Lenis({
  wheelMultiplier: 0.3,
  touchMultiplier: 0.7,
  syncTouch: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
</script>

<style lang="scss" scoped></style>
