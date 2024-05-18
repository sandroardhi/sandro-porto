<template>
  <base-container id="main_page">
    <navbar-component></navbar-component>
    <section
      class="`w-full h-[200vh] relative top-0 bg-black flex justify-center items-center`"
      :style="{ transform: matrixContainer1 }"
    >
      <div
        class="w-full h-screen flex items-center bg-black justify-center z-10 overflow-hidden relative"
        id="intro_cover"
      >
        <div
          class="absolute uppercase top-0 left-0 w-full h-full flex flex-col items-center bg-black justify-center mix-blend-exclusion text-center text-[#E1EFF3] z-[3]"
          id="intro_body"
        >
          <div class="relative">
            <span class="absolute -top-5"
              >Hello
              <span v-if="name" class="uppercase"
                ><span
                  class="bg-[#E1EFF3] text-black py-[1px] px-[2px] mx-[2px] font-bold"
                  >{{ name }}</span
                ><span>,</span></span
              >
              and</span
            >
            <span class="text-[#E1EFF3] text-5xl text-pretty lg:text-6xl"
              >Welcome to img 3's portofolio.</span
            >
            <!-- <span class="absolute -bottom-5 right"
              >Before we begin...</span
            > -->
            <div
              class="relative h-11 mx-auto w-[85%] md:w-full mt-[0.5rem]"
              v-if="name == null || name === ''"
            >
              <form @submit.prevent="submitName()">
                <input
                  placeholder="whats your name?"
                  v-model="nameForm"
                  autofocus
                  class="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                />
                <button
                  :class="
                    nameForm == null || nameForm === ''
                      ? 'opacity-0'
                      : 'opacity-100 w-8 h-8 absolute right-2 bottom-0 hover:right-0 transition-all duration-300 ease-in-out'
                  "
                  type="submit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    transform="rotate(90)"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M12 4V20M12 4L8 8M12 4L16 8"
                        stroke="#E1EFF3"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                    </g>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div
          class="backdrop absolute top-0 left-0 w-full h-full z-[2] backdrop-blur-[3px]"
        ></div>
        <div
          class="absolute top-0 left-0 w-full -z-1 h-full flex justify-center items-center"
          id="intro_background"
          :style="{ transform: translateIntroCover }"
        >
          <video
            src="@\assets\videos\intro_video.mp4"
            class="w-full h-full md:w-[110%] md:h-[110%] object-cover md:object-contain"
            muted
            loop
            playsinline
            autoplay
          >
            <source src="@\assets\videos\intro_video.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="scroll_hint z-[5] w-8 h-8 absolute bottom-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            transform="rotate(270)"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z"
                fill="#E1EFF3"
              ></path>
            </g>
          </svg>
        </div>
        <span></span>
      </div>
      <div
        class="w-full h-screen absolute bg-transparent flex justify-center items-center"
        id="about_me_container"
        :style="{ transform: translateAboutMe }"
      >
        <div
          class="w-full h-full p-10 flex justify-center items-center"
        >
          <div
            class="backdrop absolute w-full h-[120%] z-[2] backdrop-blur-[55px]"
          ></div>
          <Transition>
            <div
              v-if="containerTwoVisibility"
              class="absolute w-[88%] h-[70%] lg:w-[75%] lg:h-[76%] mt-[6rem] z-[-1] rounded-full bg-purple-600"
            ></div>
          </Transition>
          <div
            class="w-full lg:w-[80%] min-h-[50%] flex flex-col lg:h-auto bg-[#161B22] rounded-2xl z-[3] border border-[#30363D] mt-[6rem] p-8"
            id="about_me_card"
          >
            <div class="w-full flex items-center">
              <h1 class="text-2xl md:text-5xl">ABOUT ME</h1>
              <span
                class="flex-grow ml-4 h-[3px] bg-[#30363D] inline-block"
              ></span>
            </div>
            <div class="w-full h-auto mt-5 lg:flex items-center">
              <div>
                <div
                  class="w-24 h-24 mr-3 lg:w-40 lg:h-40 rounded-full relative float-left"
                >
                  <img
                    src="/src/assets/images/profile-pic.jpeg"
                    class="w-full h-full object-cover rounded-full"
                    alt="profile-pic"
                  />
                </div>
              </div>
              <p class="text-wrap">
                Hello, my name is Sandro Ardhi Saputra. I am an enthusiastic and
                highly motivated Software Engineering graduate from SMKN 2
                Surabaya with a strong foundation in web development. Proficient
                in utilizing cutting-edge technology and tools such as Laravel
                and Vue.js to create efficient and user-friendly applications.
                Strong in problem solving, teamwork, and has a high desire to
                learn.
              </p>
            </div>
            <div class="w-full flex items-center mt-5">
              <h1 class="text-2xl md:text-5xl">SKILLS</h1>
              <span
                class="flex-grow ml-4 h-[3px] bg-[#30363D] inline-block"
              ></span>
            </div>
            <div
              class="w-full h-auto mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <div
                class="col-span-1 h-16"
                v-for="skill in skills"
                :key="skill.id"
              >
                <CardSkill
                  :skill-logo="skill.skillLogo"
                  :skill-name="skill.skillName"
                  :skill-desc="skill.skillDesc"
                  :id="skill.id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section-container bg-color="#FFF" id="projects_container" class="mb-20">
      <div
        :class="
          containerTwoVisibility
            ? 'ml-4 w-full md:mx-auto h-screen translate-y-[-20px]'
            : 'hidden '
        "
      >
        <Vue3Marquee
          class="bg-black lg:text-5xl md:text-4xl text-3xl uppercase absolute top-[-50px] -left-10 overflow-y-hidden p-7 border-2 rotate-[9deg] origin-left"
          style="width: 120% !important; position: absolute"
          ><div class="relative">
            Projects Projects Projects Projects Projects Projects Projects
            Projects Projects Projects Projects Projects Projects Projects
          </div></Vue3Marquee
        >
        <Vue3Marquee
          direction="reverse"
          style="width: 120% !important; position: absolute"
          class="bg-black lg:text-5xl md:text-4xl text-3xl uppercase absolute -top-2 p-7 border-2 -left-10 overflow-y-hidden -rotate-[9deg]"
          ><div class="relative">
            Projects Projects Projects Projects Projects Projects Projects
            Projects Projects Projects Projects Projects Projects Projects
          </div></Vue3Marquee
        >
        <Splide
          @splide:active="onSplideActive"
          :has-track="false"
          :options="options"
          aria-label="Projects Carousel"
          class="mx-auto"
        >
          <SplideTrack>
            <SplideSlide v-for="(project, i) in projects" :key="i">
              <router-link
                :to="'/project-detail/' + project.id"
                class="w-full h-full relative"
              >
                <div class="splide__slide__container mt-[5rem]">
                  <img :src="project.projectImg" :alt="project.projectName" />
                </div>
                <div
                  :id="'projectDesc_' + i"
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
                        class="px-2 py-1 rounded-full border-2 w-fit mx-1 my-1 text-xs md:text-md lg:text-xl"
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
    <section class="w-full h-52 -mt-52">
      <footer-component></footer-component>
    </section>
  </base-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import SectionContainer from "@/components/SectionContainer.vue";
import BaseContainer from "@/components/BaseContainer.vue";
import NavbarComponent from "@/components/NavbarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import CardSkill from "@/components/CardSkill.vue";
import "@splidejs/vue-splide/css";
import { SplideTrack } from "@splidejs/vue-splide";
import projects from "@/projects.json";
import { Vue3Marquee } from "vue3-marquee";
import { RouterLink } from "vue-router";

const introCoverHeight = ref(0);
const aboutMeHeight = ref(0);
const aboutMeCardHeight = ref(0);
const distance = ref(0);

const scrollYValue = ref(0);
const scrollHeight = ref(0);
const windowWidth = ref(0);
const windowHeight = ref(0);

const containerTwoVisibility = ref(false);

const introCover = ref(0);
const aboutMe = ref(0);

const introVideoDownSpeed = ref(0.8);

const name = ref(null);
const nameForm = ref(null);

const options = {
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
  currentDescription.classList.add("opacity-100");
  // Add 'hidden' class to other descriptions
  for (let i = 0; i < projects.length; i++) {
    if (i !== slide.index) {
      const otherDescription = document.getElementById("projectDesc_" + i);
      otherDescription.classList.add("opacity-0");
      otherDescription.classList.remove("opacity-100");
    }
  }
};

const skills = ref([
  {
    id: 1,
    skillName: "Vue.JS",
    skillLogo: "vue.png",
    skillDesc:
      "Vue (pronounced /vjuː/, like view) is a JavaScript framework for building user interfaces. It builds on top of standard HTML, CSS, and JavaScript and provides a declarative, component-based programming model that helps you efficiently develop user interfaces of any complexity.",
  },
  {
    id: 2,
    skillName: "Laravel",
    skillLogo: "laravel.png",
    skillDesc:
      "Laravel is a free and open-source PHP- based web framework for building high-end web applications. It was created by Taylor Otwell and intended for the development of web applications following the model–view–controller (MVC) architectural pattern and based on Symfony. Some of the features of Laravel include modular packaging system with a dedicated dependency manager, different ways for accessing relational databases, utilities that aid in application deployment and maintenance, and its orientation toward syntactic sugar.",
  },
  {
    id: 3,
    skillName: "Tailwind",
    skillLogo: "tailwind.svg",
    skillDesc:
      "Tailwind CSS is a CSS framework that includes a collection of utility classes for quickly building custom interfaces. Tailwind CSS is different from CSS frameworks such as Bootstrap, Bulma, or Foundation, because Tailwind CSS is not a UI Framework.[5] Tailwind CSS has neither a default theme nor built-in UI components. Tailwind CSS is designed to be used by users according to the custom designs they want.",
  },
  {
    id: 4,
    skillName: "JavaScript",
    skillLogo: "js.png",
    skillDesc:
      "An object-oriented computer programming language commonly used to create interactive effects within web browsers.",
  },
  {
    id: 5,
    skillName: "HTML",
    skillLogo: "html.png",
    skillDesc:
      "Hypertext Markup Language, a standardized system for tagging text files to achieve font, color, graphic, and hyperlink effects on World Wide Web pages.",
  },
  {
    id: 6,
    skillName: "CSS",
    skillLogo: "css.png",
    skillDesc: "CSS is the language we use to style a Web page",
  },
]);

const submitName = () => {
  if (nameForm.value == null || nameForm.value === "") {
    return;
  } else {
    sessionStorage.setItem("name", nameForm.value);
    name.value = nameForm.value;
    nameForm.value = null;
  }
};

const isOpen = ref(null);
const menuClicked = () => {
  isOpen.value = !isOpen.value;
};

const checkName = () => {
  const nameSession = sessionStorage.getItem("name");
  if (nameSession) {
    name.value = nameSession;
  }
};

window.addEventListener("scroll", function (event) {
  scrollYValue.value = this.scrollY;

  introCover.value =
    scrollYValue.value / (scrollHeight.value - introCoverHeight.value);
  aboutMe.value =
    scrollYValue.value / (scrollHeight.value - aboutMeHeight.value);
});

const projectsContainerMarginTopCalc = () => {
  // Get references to your container and object
  var aboutMeContainer = document.getElementById("about_me_container");
  var projectsContainer = document.getElementById("projects_container");
  var object = document.getElementById("about_me_card");
  var addOnHeight = window.innerHeight / 5;

  // CALC OVERFLOW
  // Get the actual height of the object
  var objectHeight = object.scrollHeight;

  // Get the height of the container
  var containerHeight = aboutMeContainer.clientHeight;

  // Calculate overflow height if the object overflows
  var overflowHeight =
    objectHeight > containerHeight ? (objectHeight - containerHeight): 0;
  // END OF CALC OVERFLOW

  // CALC DISTANCE
  // Get the bottom position of the first element
  var bottomOfElement1 = aboutMeContainer.getBoundingClientRect().bottom;

  // Get the top position of the second element
  var topOfElement2 = projectsContainer.getBoundingClientRect().top;

  // Calculate the distance between them
  var distanceCalc =  bottomOfElement1 + overflowHeight - topOfElement2 + addOnHeight
  if (distance.value == 0) {
    distance.value = distanceCalc;
    projectsContainer.style.transform = `matrix(1,0,0,1,0,${distance.value})`;
  }
};

watch(containerTwoVisibility, () => {
  projectsContainerMarginTopCalc();
});

// Function to update height values
const updateHeights = () => {
  scrollHeight.value = document.body.scrollHeight - 607;
  aboutMeCardHeight.value =
    document.getElementById("about_me_card").offsetHeight;
  introCoverHeight.value = document.getElementById("intro_cover").offsetHeight;

  aboutMeHeight.value =
    document.getElementById("about_me_container").offsetHeight;
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

// Call updateHeights when component is mounted
onMounted(() => {
  updateHeights();
  checkName();
  // Listen for window resize event and update heights accordingly
  window.addEventListener("resize", updateHeights);
});

// Remove event listener when component is unmounted to prevent memory leaks
onUnmounted(() => {
  window.removeEventListener("resize", updateHeights);
});

const matrixContainer1 = computed(() => {
  const matrixContainer1 = scrollYValue.value;
  const cappedmatrixContainer1 =
    matrixContainer1 > 303 ? 303 : matrixContainer1;
  return `matrix(1,0,0,1,0,-${cappedmatrixContainer1})`;
});

const translateIntroCover = computed(() => {
  const translateYValue = introCover.value * 100 * introVideoDownSpeed.value;
  const cappedTranslateYValue = translateYValue > 100 ? 100 : translateYValue;
  return `translateY(${cappedTranslateYValue}%)`;
});

const translateAboutMe = computed(() => {
  const translateYValue = aboutMe.value * 100 * 2;
  const cappedTranslateYValue = translateYValue > 100 ? 100 : translateYValue;
  if (cappedTranslateYValue == 100) {
    containerTwoVisibility.value = true;
  } else {
    containerTwoVisibility.value = false;
  }

  let scale3dValue = cappedTranslateYValue;

  if (cappedTranslateYValue < 50) {
    scale3dValue = 50;
  }

  return `translateY(${cappedTranslateYValue}%) `;
});
</script>

<style>
#main_page {
  font-family: "Nimbus Sans";
  color: #e1eff3;
}
body {
  margin: 0;
}
input::placeholder {
  font-family: "Nimbus Sans";
  text-transform: uppercase;
}
.scroll_hint {
  animation: jumpInfinite 1.5s infinite;
}

@keyframes jumpInfinite {
  0% {
    bottom: 20px;
  }
  50% {
    bottom: 35px;
  }
  100% {
    bottom: 20px;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
