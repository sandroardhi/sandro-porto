<script setup>
import { RouterView, useRoute } from "vue-router";

const route = useRoute()
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
</template>

<style>
@font-face {
  font-family: "Nimbus Sans";
  src: url("@/assets/fonts/NimbusSanL-Reg.otf");
}
div {
  box-sizing: border-box;
}

/* A good global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
