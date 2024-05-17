<template>
  <div
    :class="`w-full h-screen bg-[${props.bgColor}] relative flex justify-center items-center`"
  >
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  bgColor: {
    type: String,
    default: "#000",
  },
});
</script>
