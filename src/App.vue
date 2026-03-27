<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import AppFooter from "@/components/AppFooter.vue";

const route = useRoute();
const isHomePage = computed(() => route.path === "/");

const afVisible = ref(false);
const afShowText = ref(false);
const afShowClose = ref(false);
let triggered = false;

const isAprilFools = () => {
  const now = new Date();
  return now.getMonth() === 3 && now.getDate() === 1;
};

const trigger = () => {
  if (triggered || !isAprilFools()) return;
  triggered = true;

  removeListeners();
  afVisible.value = true;
  document.documentElement.style.overflow = "hidden";

  setTimeout(() => {
    afShowText.value = true;
  }, 5000);

  setTimeout(() => {
    afShowClose.value = true;
  }, 8000);
};

const removeListeners = () => {
  window.removeEventListener("click", trigger);
  window.removeEventListener("keydown", trigger);
  window.removeEventListener("scroll", trigger);
};

const closeAf = () => {
  afVisible.value = false;
  document.documentElement.style.overflow = "";
};

onMounted(() => {
  window.addEventListener("click", trigger);
  window.addEventListener("keydown", trigger);
  window.addEventListener("scroll", trigger);
});

onUnmounted(() => {
  removeListeners();
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <Transition name="af">
    <div v-if="afVisible" class="af-overlay">
      <div v-if="afShowText" class="af-side-text left">APRIL FOOLS!</div>
      <div v-if="afShowText" class="af-side-text right">APRIL FOOLS!</div>

      <div class="af-video-wrap">
        <iframe
          class="af-video"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1&controls=0&disablekb=1"
          allow="autoplay; encrypted-media"
          allowfullscreen
          frameborder="0"
        ></iframe>
        <div class="af-blocker"></div>
        <Transition name="af-close">
          <button
            v-if="afShowClose"
            class="af-close"
            @click="closeAf"
            aria-label="Close"
          >
            ✕
          </button>
        </Transition>
      </div>
    </div>
  </Transition>

  <NavBar />

  <main :class="{ 'home-page': isHomePage }">
    <RouterView />
  </main>

  <AppFooter />
</template>

<style scoped>
.af-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0a0b0e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.af-video-wrap {
  position: fixed;
  inset: 0;
}

.af-video {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.af-blocker {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.af-side-text {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  font-size: min(8vw, 7vh);
  font-weight: 900;
  z-index: 10;
  white-space: nowrap;
  pointer-events: none;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: -0.5vh;
  line-height: 1;
  animation: flash-colors 0.15s infinite;
}

.af-side-text.left {
  left: 60px;
}
.af-side-text.right {
  right: 60px;
}

@keyframes flash-colors {
  0% {
    color: #ff0000;
    text-shadow: 4px 4px #00ff00;
  }
  25% {
    color: #ffff00;
    text-shadow: -4px -4px #ff00ff;
  }
  50% {
    color: #00ffff;
    text-shadow: 4px -4px #0000ff;
  }
  75% {
    color: #ff00ff;
    text-shadow: -4px 4px #ffffff;
  }
  100% {
    color: #00ff00;
    text-shadow: 4px 4px #ff0000;
  }
}

.af-close {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  z-index: 3;
}

.af-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.af-enter-active,
.af-leave-active {
  transition: opacity 0.4s ease;
}
.af-enter-from,
.af-leave-to {
  opacity: 0;
}

.af-close-enter-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}
.af-close-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.home-page {
  min-height: 100vh;
}
</style>
