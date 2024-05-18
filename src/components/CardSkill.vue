<template>
  <div
    class="w-full h-full rounded-lg border flex items-center p-1 break-all relative cursor-pointer"
    @click="skillClicked(props.id)"
  >
    <div
      class="w-[40%] min-w-5 max-w-5 md:min-w-7 md:max-w-7 m-1 transition-all ease-in duration-300"
      :id="'skillLogo' + props.id"
    >
      <img
        :src="`/images/skill-logos/${props.skillLogo}`"
        alt="skill-logo"
        class="h-[36px] object-contain object-center"
      />
    </div>
    <p
      class="text-xs sm:text-xl text-[#E1EFF3] ml-2"
      :id="'skillName' + props.id"
    >
      {{ props.skillName }}
    </p>
    <div
      class="w-full h-36 absolute left-0 -top-36 bg-black text-white border-[2px] break-normal p-1 hidden transition-all ease-in duration-300 overflow-auto"
      :id="'skillDesc' + props.id"
    >
      {{ props.skillDesc }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  skillName: String,
  skillLogo: String,
  skillDesc: String,
  id: Number,
});

const skillClicked = (id) => {
  const skillDesc = document.getElementById("skillDesc" + id);
  const skillLogo = document.getElementById("skillLogo" + id);
  const skillName = document.getElementById("skillName" + id);

  skillLogo.classList.toggle("relative");
  skillLogo.classList.toggle("left-1/2");
  skillLogo.classList.toggle("transform");
  skillLogo.classList.toggle("-translate-x-1/2");
  skillName.classList.toggle("opacity-0");
  skillDesc.classList.toggle("hidden");
};
</script>
