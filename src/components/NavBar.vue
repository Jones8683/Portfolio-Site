<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isMinimized = ref(false);
const shouldShow = ref(true);
let lastScrollY = 0;
let ticking = false;

const route = useRoute();
const isProjectsActive = computed(() => route.path.startsWith('/projects'));
const isArcadeActive = computed(() => route.path.startsWith('/play'));

const updateHeaderState = () => {
  const currentScrollY = window.scrollY;
  isMinimized.value = currentScrollY > 20;
  shouldShow.value = currentScrollY < 350 || currentScrollY < lastScrollY;
  lastScrollY = currentScrollY;
  ticking = false;
};

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(updateHeaderState);
    ticking = true;
  }
};

onMounted(() => {
  updateHeaderState();
  window.addEventListener('scroll', handleScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <header class="main-header" :class="{ minimized: isMinimized }" :data-show="shouldShow">
    <div class="nav-container">
      <div class="nav-left">
        <RouterLink to="/" class="nav-name-link">
          <span class="nav-name">Jones Jankovic</span>
        </RouterLink>
      </div>
      <div class="nav-right">
        <div class="glass-nav">
          <RouterLink to="/projects" class="glass-btn" :class="{ active: isProjectsActive }"
            >Projects</RouterLink
          >
          <RouterLink to="/play" class="glass-btn" :class="{ active: isArcadeActive }"
            >Arcade</RouterLink
          >
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.main-header {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  z-index: 1000;
  background-color: rgba(10, 11, 14, 0);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0);
  transition:
    top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized {
  top: 15px;
  width: 90%;
  max-width: 800px;
  background-color: rgba(22, 22, 22, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(132, 132, 132, 0.12);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.main-header[data-show='false'] {
  transform: translate(-50%, -120px);
}

.main-header[data-show='true'] {
  transform: translate(-50%, 0);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: var(--nav-height);
  padding: 20px 80px;
  transition:
    padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    min-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized .nav-container {
  min-height: 46px;
  padding: 2px 6px 2px 17px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.glass-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.glass-btn {
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-ui, 'Satoshi', 'Segoe UI', sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-1px);
}

.glass-btn.active {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.nav-name-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.3s ease;
}

.nav-name-link:hover {
  opacity: 0.75;
}

.nav-name {
  font-family: var(--font-display, 'Cherry Bomb One', cursive);
  font-size: 1.7rem;
  color: #ffffff;
  letter-spacing: 0.015em;
  line-height: 1;
  position: relative;
  top: -2px;
}

.nav-right {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: 8px;
  transform: translateX(-1px);
}

.glass-btn:focus-visible,
.nav-name-link:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@media (max-width: 650px) {
  .nav-name {
    display: none;
  }

  .nav-container {
    padding: 10px 16px;
    justify-content: space-between;
  }

  .nav-left {
    gap: 0;
  }

  .glass-nav {
    gap: 8px;
  }

  .glass-btn {
    padding: 8px 14px;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-right {
    gap: 12px;
  }
}
</style>
