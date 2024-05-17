import './assets/main.css'
import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSplide from '@splidejs/vue-splide';
import Vue3Marquee from 'vue3-marquee'


const app = createApp(App)

app.use( VueSplide );
app.use( Vue3Marquee );
app.use(router)

app.mount('#app')
