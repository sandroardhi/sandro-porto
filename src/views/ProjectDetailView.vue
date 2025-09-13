<template>
  <base-container>
    <navbar-component></navbar-component>
    <section-container class="mt-[5rem] mb-10 px-[1rem] md:px-[2rem]">
      <div
        class="w-full flex justify-center items-center h-auto relative mb-[1rem]"
      >
        <router-link to="/" class="absolute left-0 w-8 h-8"
          ><svg
            viewBox="0 0 1024 1024"
            fill="#fff"
            class="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#fff"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z"
                fill=""
              ></path>
            </g>
          </svg>
        </router-link>
        <span class="w-[50px] h-[2px] bg-[#30363D] mr-4"></span>
        <h1
          class="text-3xl md:text-5xl text-white font-bold relative z-[1] after:absolute after:content-[''] after:w-full after:h-[9px] after:bg-purple-600 after:bottom-[2px] after:left-0 after:z-[-1]"
        >
          {{ filteredProject.projectName }}
        </h1>
        <span class="w-[50px] h-[2px] bg-[#30363D] ml-4"></span>
      </div>
      <div>
        <div class="w-full flex items-center">
          <h1 class="text-2xl md:text-4xl py-3 px-2 my-2 text-white">
            Project's Overview
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <div class="px-3 pb-4 lg:w-4/5">
          <p
            class="text-white text-xl project-desc"
            v-html="filteredProject.projectDesc"
          ></p>
        </div>
      </div>
      <div>
        <div class="w-full flex items-center">
          <h1 class="text-2xl md:text-4xl py-3 px-2 my-2 text-white">
            Project's Tech Stack
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <div class="px-3 pb-4 lg:w-4/5">
          <div
            class="w-full h-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              class="col-span-1 h-16"
              v-for="(tech, i) in filteredProject.techStack"
              :key="i"
            >
              <CardSkill
                :skill-logo="tech.techLogo"
                :skill-name="tech.techName"
                :skill-desc="tech.techDesc"
                :id="tech.id"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          class="w-full flex items-center"
          v-if="filteredProject.responsibilities"
        >
          <h1 class="text-2xl md:text-4xl py-3 px-2 my-2 text-white">
            Responsibilities
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <div
          class="px-3 pb-4 lg:w-4/5 text-white responsibilities"
          v-html="filteredProject.responsibilities"
        ></div>
      </div>
      <Splide
        @splide:active="onSplideActive"
        :has-track="false"
        :options="options"
        aria-label="Projects Carousel"
        class="mt-5"
      >
        <div class="w-full flex items-center">
          <h1 class="text-2xl md:text-4xl py-3 px-2 my-2 text-white">
            Project's Screenshot
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <SplideTrack>
          <SplideSlide
            v-for="(project, i) in filteredProject.projectDetail"
            :key="i"
          >
            <img
              :src="'/sandro-porto//' + project.detailImg"
              :alt="filteredProject.projectName"
            />
            <div
              :id="'projectDesc_' + i"
              class="opacity-0 max-h-[100px] transition-all ease-in-out duration-300 flex flex-col text-white"
            >
              <p class="mt-2 first-letter:uppercase">
                {{ project.detailDesc }}
              </p>
            </div>
          </SplideSlide>
        </SplideTrack>

        <div class="splide__arrows">
          <button class="splide__arrow splide__arrow--prev">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#000000"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                  fill="#0F0F0F"
                ></path>
              </g>
            </svg>
          </button>
          <button class="splide__arrow splide__arrow--next">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              transform="rotate(0)"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                  fill="#0F0F0F"
                ></path>
              </g>
            </svg>
          </button>
        </div>
      </Splide>
      <div class="mt-5">
        <div class="w-full flex items-center">
          <h1 class="text-2xl md:text-4xl py-3 px-2 my-2 text-white">
            Project's Challanges
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <div class="px-3 pb-4 lg:w-4/5">
          <p class="text-white text-xl">{{ filteredProject.challanges }}</p>
        </div>
      </div>
      <div class="">
        <div class="w-full flex items-center">
          <span class="flex-grow mr-4 h-[2px] bg-[#30363D] inline-block"></span>
          <h1
            class="text-2xl md:text-4xl px-2 my-7 text-white relative z-[1] after:absolute after:content-[''] after:w-full after:h-[10px] after:bg-purple-600 after:bottom-[2px] after:left-0 after:z-[-1]"
          >
            Other Projects
          </h1>
          <span class="flex-grow ml-4 h-[2px] bg-[#30363D] inline-block"></span>
        </div>
        <Splide
          @splide:active="onSplideActive2"
          :has-track="false"
          :options="options2"
          aria-label="Projects Carousel"
          class="text-white"
        >
          <SplideTrack>
            <SplideSlide v-for="(project, i) in filteredOtherProjects" :key="i">
              <router-link
                :to="'/project-detail/' + project.id"
                class="w-full h-full relative"
              >
                <div class="splide__slide__container mt-[5rem]">
                  <img
                    :src="'/sandro-porto/' + project.projectImg"
                    :alt="project.projectName"
                  />
                </div>
                <div
                  :id="'projectDescOther_' + i"
                  class="opacity-0 transition-all ease-in-out duration-300 flex flex-col items-center justify-center"
                >
                  <h1
                    id="projectName"
                    class="text-2xl absolute top-0 left-0 uppercase py-3 px-2 font-bold my-2 bg-white text-black"
                  >
                    {{ project.projectName }}
                  </h1>
                  <p class="mt-4">
                    {{ project.projectDesc }}
                  </p>
                  <div class="w-full h-auto flex justify-between mt-3">
                    <div class="flex flex-wrap">
                      <p
                        class="px-2 py-1 rounded-full border-2 w-fit mx-1 my-1 text-xs md:text-base"
                        v-for="(tech, i) in project.techStack"
                        :key="i"
                      >
                        {{ tech.techName }}
                      </p>
                    </div>
                    <div>
                      <p
                        class="px-2 py-1 hover:border-b transition-all ease-in duration-150"
                      >
                        click to see more ->
                      </p>
                    </div>
                  </div>
                </div>
              </router-link>
            </SplideSlide>
          </SplideTrack>

          <div class="splide__arrows">
            <button class="splide__arrow splide__arrow--prev">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#000000"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                    fill="#0F0F0F"
                  ></path>
                </g>
              </svg>
            </button>
            <button class="splide__arrow splide__arrow--next">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                transform="rotate(0)"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                    fill="#0F0F0F"
                  ></path>
                </g>
              </svg>
            </button>
          </div>
        </Splide>
      </div>
    </section-container>
    <section class="w-full h-52">
      <footer-component></footer-component>
    </section>
  </base-container>
</template>

<script setup>
import projects from "@/projects.json";
import BaseContainer from "@/components/BaseContainer.vue";
import SectionContainer from "@/components/BaseContainer.vue";
import NavbarComponent from "@/components/NavbarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import CardSkill from "@/components/CardSkill.vue";
import "@splidejs/vue-splide/css";
import { SplideTrack } from "@splidejs/vue-splide";
import { useRoute, RouterLink } from "vue-router";
import { onMounted, ref, computed, onBeforeMount } from "vue";

const route = useRoute();
const id = ref(null);

const options = {
  width: "100%",
  padding: "20%",
  focus: "center",
  gap: "40px",
  perPage: 2,
  arrows: true,
  pagination: false,
  // autoplay: true,
  breakpoints: {
    640: {
      gap: "20px",
      perPage: 1,
      padding: "10%",
    },
    768: {
      gap: "40px",
    },
    1024: {
      gap: "40px",
    },
  },
};
const options2 = {
  width: "100%",
  padding: "20%",
  focus: "center",
  gap: "40px",
  arrows: true,
  pagination: false,
  // autoplay: true,
  breakpoints: {
    640: {
      gap: "20px",
      padding: "10%",
    },
    768: {
      gap: "40px",
    },
    1024: {
      gap: "40px",
    },
  },
};
// let currentSlideIndex = ref(2);
const onSplideActive = (slide) => {
  console.log("active");
  console.log(slide.index);
  const currentDescription = document.getElementById(
    "projectDesc_" + slide.index
  );
  currentDescription.classList.remove("opacity-0");
  currentDescription.classList.remove("max-h-[100px]");
  currentDescription.classList.add("opacity-100");
  currentDescription.classList.add("max-h-[10000px]");
  // Add 'hidden' class to other descriptions
  for (let i = 0; i < filteredProject.value.projectDetail.length; i++) {
    if (i !== slide.index) {
      const otherDescription = document.getElementById("projectDesc_" + i);
      otherDescription.classList.add("opacity-0");
      otherDescription.classList.add("max-h-[100px]");
      otherDescription.classList.remove("opacity-100");
      otherDescription.classList.remove("max-h-[10000px]");
    }
  }
};
const onSplideActive2 = (slide) => {
  console.log("active");
  console.log(slide.index);
  const currentDescription = document.getElementById(
    "projectDescOther_" + slide.index
  );
  currentDescription.classList.remove("opacity-0");
  currentDescription.classList.add("opacity-100");
  // Add 'hidden' class to other descriptions
  for (let i = 0; i < projects.length; i++) {
    if (i !== slide.index) {
      const otherDescription = document.getElementById("projectDescOther_" + i);
      otherDescription.classList.add("opacity-0");
      otherDescription.classList.remove("opacity-100");
    }
  }
};
const filteredProject = computed(() => {
  const filteredProjects = projects.filter(
    (project) => project.id === id.value
  );
  return filteredProjects[0];
});
const filteredOtherProjects = computed(() => {
  return projects.filter((project) => project.id !== id.value);
});
onBeforeMount(() => {
  id.value = route.params.id;
});
onMounted(() => {
  console.log(filteredProject.value);
});
</script>

<style>
.project-desc a {
  text-decoration: underline;
  text-decoration-color: #fff;
}
.responsibilities p {
  @apply text-xl mb-4;
}
.responsibilities li h6 {
  @apply text-xl font-medium;
}
.responsibilities li {
  @apply mb-3 text-lg text-pretty;
}
.responsibilities ul {
  @apply list-disc mb-2 pl-4;
}
</style>
