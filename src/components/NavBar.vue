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
  <div class="nav-shell">
    <header class="main-header" :class="{ minimized: isMinimized }" :data-show="shouldShow">
      <div class="nav-left">
        <RouterLink to="/" class="nav-brand" aria-label="Jones Jankovic — Home">
          <span class="nav-name">
            <span class="name-anchor-first" aria-hidden="true">J</span>
            <span class="name-segment" aria-hidden="true">
              <span class="name-segment-text">ones&nbsp;</span>
            </span>
            <span class="name-anchor-second" aria-hidden="true">Jank</span>
            <span class="name-segment" aria-hidden="true">
              <span class="name-segment-text">ovic</span>
            </span>
          </span>
        </RouterLink>
        <div class="glass-nav">
          <RouterLink to="/projects" class="glass-btn" :class="{ active: isProjectsActive }"
            >Projects</RouterLink
          >
          <RouterLink to="/play" class="glass-btn" :class="{ active: isArcadeActive }"
            >Arcade</RouterLink
          >
        </div>
      </div>
      <nav class="nav-actions">
        <a
          href="https://discord.com/users/1537745548000497716"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord Profile"
          class="nav-icon"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M18.59 5.88997C17.36 5.31997 16.05 4.89997 14.67 4.65997C14.5 4.95997 14.3 5.36997 14.17 5.69997C12.71 5.47997 11.26 5.47997 9.83001 5.69997C9.69001 5.36997 9.49001 4.95997 9.32001 4.65997C7.94001 4.89997 6.63001 5.31997 5.40001 5.88997C2.92001 9.62997 2.25001 13.28 2.58001 16.87C4.23001 18.1 5.82001 18.84 7.39001 19.33C7.78001 18.8 8.12001 18.23 8.42001 17.64C7.85001 17.43 7.31001 17.16 6.80001 16.85C6.94001 16.75 7.07001 16.64 7.20001 16.54C10.33 18 13.72 18 16.81 16.54C16.94 16.65 17.07 16.75 17.21 16.85C16.7 17.16 16.15 17.42 15.59 17.64C15.89 18.23 16.23 18.8 16.62 19.33C18.19 18.84 19.79 18.1 21.43 16.87C21.82 12.7 20.76 9.08997 18.61 5.88997H18.59ZM8.84001 14.67C7.90001 14.67 7.13001 13.8 7.13001 12.73C7.13001 11.66 7.88001 10.79 8.84001 10.79C9.80001 10.79 10.56 11.66 10.55 12.73C10.55 13.79 9.80001 14.67 8.84001 14.67ZM15.15 14.67C14.21 14.67 13.44 13.8 13.44 12.73C13.44 11.66 14.19 10.79 15.15 10.79C16.11 10.79 16.87 11.66 16.86 12.73C16.86 13.79 16.11 14.67 15.15 14.67Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          href="https://github.com/Jones8683"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          class="nav-icon"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              fill="currentColor"
            />
          </svg>
        </a>
      </nav>
    </header>
  </div>
</template>

<style scoped>
.nav-shell {
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  margin-inline: auto;
  width: min(100% - 2rem, 1080px);
  z-index: 1000;
  pointer-events: none;
}

.main-header {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 60px;
  padding: 8px 20px;
  margin-inline: 0;
  border-radius: 16px;
  border: 2px solid transparent;
  background-color: rgba(10, 11, 14, 0);
  transform: translateY(0);
  will-change: transform;
  transition:
    margin-inline 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.main-header.minimized {
  min-height: 52px;
  padding: 6px 16px;
  background-color: hsl(240 5.9% 12%);
  border-color: hsl(240 3.7% 19.9%);
  box-shadow:
    rgba(24, 24, 27, 0.08) 0px 0px 0px 1px,
    rgba(39, 39, 42, 0.08) 0px 10px 15px -3px,
    rgba(39, 39, 42, 0.08) 0px 4px 6px -4px;
}

.main-header[data-show='false'] {
  transform: translateY(calc(-100% - 24px));
}

@media (min-width: 800px) {
  .main-header.minimized {
    margin-inline: 8%;
  }
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-inline-start: 0;
  transition: margin-inline-start 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized .nav-left {
  margin-inline-start: 8px;
}

.glass-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.nav-name {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--font-display, 'Cherry Bomb One', cursive);
  font-size: 1.7rem;
  color: #ffffff;
  letter-spacing: 0.015em;
  line-height: 1;
  position: relative;
  top: -2px;
  font-weight: 400;
}

.name-anchor-first,
.name-anchor-second,
.name-segment,
.name-segment-text {
  font-family: inherit;
}

.name-anchor-first {
  letter-spacing: normal;
  margin-right: -0.09em;
}

.name-anchor-second {
  letter-spacing: normal;
  margin-right: -0.03em;
}

.name-segment {
  display: inline-grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.name-segment-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-brand:hover .name-segment,
.nav-brand:focus-visible .name-segment {
  grid-template-columns: 1fr;
}

.nav-brand:hover .name-segment-text,
.nav-brand:focus-visible .name-segment-text {
  opacity: 1;
  transition-delay: 0.08s;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-inline-end: 0;
  transition:
    gap 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-inline-end 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized .nav-actions {
  gap: 12px;
  margin-inline-end: 8px;
}

.glass-btn {
  font-family: var(--font-ui, 'Satoshi', 'Segoe UI', sans-serif);
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
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

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  flex-shrink: 0;
  color: #ffffff;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.nav-icon:hover {
  transform: translateY(-1px);
  opacity: 0.8;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.glass-btn:focus-visible,
.nav-icon:focus-visible,
.nav-brand:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .main-header,
  .nav-left,
  .nav-actions {
    transition: none;
  }

  .main-header[data-show='false'] {
    transform: translateY(0);
  }
}

@media (max-width: 650px) {
  .nav-shell {
    top: 12px;
    width: min(100% - 1.5rem, 1080px);
  }

  .nav-name {
    display: none;
  }

  .main-header {
    gap: 12px;
    padding: 6px 12px;
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

  .nav-actions {
    gap: 12px;
  }

  .nav-icon {
    width: 30px;
    height: 30px;
  }
}
</style>
