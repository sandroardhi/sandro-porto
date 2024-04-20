<template>
  <main data-scroll-container class="fixed top-0 left-0 w-full">
    <div
      class="`w-full h-[200vh] bg-black flex justify-center items-center`"
      :style="{ transform: matrixContainer1 }"
    >
      <section
        class="w-full h-screen bg-yellow-200 flex items-center justify-center z-10"
        :style="{ transform: translateSection1 }"
        id="section_one"
      >
        <div class="w-[50%] h-64 grid grid-cols-2">
          <div class="col-span-1 bg-red-200">
            <a href="#section_two" class="text-white"
              >scroll y val{{ scrollYValue }}</a
            >
            <p class="text-white">scroll height{{ scrollHeight }}</p>
            <p class="text-white">section height{{ sectionOneHeight }}</p>
            <p class="text-white">section one val{{ translateSection1 }}</p>
            <p class="text-white">matrixcontainer1 val{{ matrixContainer1 }}</p>
          </div>
          <div class="col-span-1 bg-green-200 flex items-center justify-center">
            <div class="w-[200px] h-[200px] rounded-full bg-white"></div>
          </div>
        </div>
        <span></span>
      </section>
      <section
        class="w-full h-screen absolute bg-green-200 -translate-y-0 flex justify-center items-center"
        :style="{ transform: translateSection2 }"
        id="section_two"
      >
        <div class="w-[50%] h-64 grid grid-cols-2">
          <div class="col-span-1 bg-red-200">
            <a href="#section_two" class="text-white"
              >scroll y val{{ scrollYValue }}</a
            >
            <p class="text-white">scroll height{{ scrollHeight }}</p>
            <p class="text-white">section height{{ sectionTwoHeight }}</p>
            <p class="text-white">section two val{{ translateSection1 }}</p>
            <p class="text-white">matrixcontainer1{{ matrixContainer1 }}</p>
          </div>
          <div class="col-span-1 bg-green-200 flex items-center justify-center">
            <div class="w-[200px] h-[200px] rounded-full bg-white"></div>
          </div>
        </div>
      </section>
    </div>

    <base-container bg-color="#FFF">
      <div class="w-full flex bg-red-200 h-screen hidden" style="transform: matrix(1,0,0,1,0,-607);">
        <p class="text-black">matrixcontainer1 val{{ matrixContainer1 }}</p>

        <p class="text-black">{{ scrollYValue }}</p>
      </div>
    </base-container>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import BaseContainer from "@/components/BaseContainer.vue";
import LocomotiveScroll from "locomotive-scroll";

const sectionOneHeight = ref(0);
const sectionTwoHeight = ref(0);

const scrollYValue = ref(0);
const scrollHeight = ref(0);

const containerOne = ref(0);
const sectionOne = ref(0);
const sectionTwo = ref(0);

window.addEventListener("scroll", function (event) {
  scrollYValue.value = this.scrollY;

  sectionOne.value =
    scrollYValue.value /
    (scrollHeight.value - document.querySelector("#section_one").offsetHeight);
  sectionTwo.value =
    scrollYValue.value /
    (scrollHeight.value - document.querySelector("#section_two").offsetHeight);
});

const matrixContainer1 = computed(() => {
  const matrixContainer1 = scrollYValue.value;
  const cappedmatrixContainer1 =
    matrixContainer1 > 607 ? 607 : matrixContainer1;
  return `matrix(1,0,0,1,0,-${cappedmatrixContainer1})`;
});

const translateSection1 = computed(() => {
  const translateYValue = sectionOne.value * 100 * 2;
  const cappedTranslateYValue = translateYValue > 50 ? 50 : translateYValue;
  return `translateY(-${cappedTranslateYValue}%)`;
});

const translateSection2 = computed(() => {
  const translateYValue = sectionTwo.value * 100 * 2;
  const cappedTranslateYValue = translateYValue > 50 ? 50 : translateYValue;
  return `translateY(${cappedTranslateYValue}%)`;
});

onMounted(() => {
  sectionOneHeight.value = document.querySelector("#section_one").offsetHeight;
  sectionTwoHeight.value = document.querySelector("#section_two").offsetHeight;

  const scroll = new LocomotiveScroll({
    el: document.querySelector("[data-scroll-container]"),
    smooth: true,
    multiplier: 0.8,
  });

  scroll.on("scroll", (args) => {
    scrollHeight.value = args.limit.y;
    scrollYValue.value = args.scroll.y;

    // Calculate the position of sectionOne and sectionTwo based on scroll position
    sectionOne.value =
      scrollYValue.value / (scrollHeight.value - sectionOneHeight.value);
    sectionTwo.value =
      scrollYValue.value / (scrollHeight.value - sectionTwoHeight.value);
  });
});
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>
