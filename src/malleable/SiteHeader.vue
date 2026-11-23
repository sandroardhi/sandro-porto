<script setup>
import { RouterLink } from 'vue-router'

// One tap from anywhere on the site to a WhatsApp chat, with an opening line filled in.
const whatsapp = 'https://wa.me/6285803967293?text=' + encodeURIComponent('Hi Sandro, I saw your portfolio and ')

const links = [
  { hash: '#how', label: 'About' },
  { hash: '#work', label: 'Work' },
  { hash: '#path', label: 'Path' },
  { hash: '#contact', label: 'Contact' },
]
</script>

<template>
  <header class="bar wrap x">
    <RouterLink class="brand" to="/">Sandro Ardhi Saputra</RouterLink>
    <nav aria-label="Sections">
      <RouterLink v-for="l in links" :key="l.hash" :to="{ path: '/', hash: l.hash }">{{ l.label }}</RouterLink>
    </nav>
    <a class="wa" :href="whatsapp" target="_blank" rel="noopener" data-liquid><i aria-hidden="true"></i><span class="long">Chat on&nbsp;</span>WhatsApp<b aria-hidden="true">↗</b></a>
  </header>
</template>
