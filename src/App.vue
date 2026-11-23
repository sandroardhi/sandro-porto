<script setup>
import { RouterView } from "vue-router";
import LiquidStage from "@/malleable/LiquidStage.vue";
import SiteHeader from "@/malleable/SiteHeader.vue";
import LiquidCursor from "@/malleable/LiquidCursor.vue";
import "@/malleable/malleable.css";
</script>

<template>
  <LiquidStage />
  <SiteHeader />
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
  <LiquidCursor />
</template>

<style>
/* A good global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
