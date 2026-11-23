<script setup>
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import projects from '@/projects.json'

const route = useRoute()
const router = useRouter()
const base = import.meta.env.BASE_URL

const index = computed(() => projects.findIndex(p => String(p.id) === String(route.params.id)))
const project = computed(() => projects[index.value] || null)
const next = computed(() => projects[(index.value + 1) % projects.length])

const withProtocol = (u) => (/^https?:\/\//.test(u) ? u : 'https://' + u)
// Some descriptions link to bare domains ("trukmu.com"); make those absolute so they don't resolve inside this site.
const fixLinks = (html) => (html || '').replace(/href='(?!https?:|mailto:|#|\/)([^']+)'/g, "href='https://$1'")
const sentence = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const view = computed(() => {
  const p = project.value
  if (!p) return null
  return {
    name: p.projectName,
    no: String(index.value + 1).padStart(2, '0'),
    stack: p.techStack.map(t => t.techName),
    url: p.projectUrl ? withProtocol(p.projectUrl) : null,
    urlLabel: p.projectUrl ? p.projectUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null,
    cover: base + p.projectImg,
    desc: fixLinks(p.projectDesc),
    challenges: p.challanges,
    role: fixLinks(p.responsibilities),
    gallery: p.projectDetail.map(d => ({ src: base + d.detailImg, caption: sentence(d.detailDesc) })),
  }
})

watchEffect(() => {
  if (!project.value) { router.replace('/'); return }
  document.title = project.value.projectName + ' · Sandro Ardhi Saputra'
})
</script>

<template>
  <main v-if="view" class="case">
    <section class="case-head wrap" data-shape="corner">
      <RouterLink class="back x" :to="{ path: '/', hash: '#work' }">← All work</RouterLink>
      <div class="slot" aria-hidden="true"></div>
      <span class="label">Case study · {{ view.no }} / {{ String(projects.length).padStart(2, '0') }}</span>
      <h1 class="x">{{ view.name }}</h1>
      <dl class="meta x">
        <div><dt class="label">Stack</dt><dd>{{ view.stack.join(' · ') }}</dd></div>
        <div>
          <dt class="label">Live</dt>
          <dd v-if="view.url"><a :href="view.url" target="_blank" rel="noopener">{{ view.urlLabel }} ↗</a></dd>
          <dd v-else>Not deployed</dd>
        </div>
      </dl>
      <img class="cover" :src="view.cover" :alt="view.name + ' home page'" decoding="async">
    </section>

    <section class="case-body wrap" data-shape="side">
      <div class="block">
        <h2 class="label">Overview</h2>
        <div class="prose x" v-html="view.desc"></div>
      </div>
      <div v-if="view.challenges" class="block">
        <h2 class="label">Challenges</h2>
        <div class="prose x"><p>{{ view.challenges }}</p></div>
      </div>
      <div v-if="view.role" class="block">
        <h2 class="label">My role</h2>
        <div class="prose x" v-html="view.role"></div>
      </div>

      <ol class="gallery">
        <li v-for="(g, i) in view.gallery" :key="g.src">
          <img :src="g.src" :alt="g.caption || view.name + ' screen ' + (i + 1)" loading="lazy" decoding="async">
          <span class="caption x"><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ g.caption }}</span>
        </li>
      </ol>
    </section>

    <section class="case-next wrap" data-shape="contact" data-slot="self">
      <span class="label x">Next project</span>
      <RouterLink class="x" :to="`/work/${next.id}`" data-liquid><b>{{ next.projectName }}</b></RouterLink>
      <span class="label x">{{ next.techStack.map(t => t.techName).join(' · ') }}</span>
    </section>
  </main>
</template>
