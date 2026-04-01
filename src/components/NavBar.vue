<script setup>
import { RouterLink } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";

const isMinimized = ref(false);
const shouldShow = ref(true);
let lastScrollY = 0;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  isMinimized.value = currentScrollY > 20;
  shouldShow.value = currentScrollY < 350 || currentScrollY < lastScrollY;
  lastScrollY = currentScrollY;
};

onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<template>
  <header
    class="main-header"
    :class="{ minimized: isMinimized }"
    :data-show="shouldShow"
  >
    <div class="nav-container">
      <div class="nav-left">
        <RouterLink to="/" class="nav-name-link">
          <span class="nav-name">Jones Jankovic</span>
        </RouterLink>
        <div class="glass-nav">
          <RouterLink to="/projects" class="glass-btn">Projects</RouterLink>
          <RouterLink to="/play" class="glass-btn">Arcade</RouterLink>
        </div>
      </div>
      <div class="nav-right">
        <a
          href="https://discord.com/users/1378992101970280471"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord Profile"
          class="nav-icon discord-icon"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.59 5.88997C17.36 5.31997 16.05 4.89997 14.67 4.65997C14.5 4.95997 14.3 5.36997 14.17 5.69997C12.71 5.47997 11.26 5.47997 9.83001 5.69997C9.69001 5.36997 9.49001 4.95997 9.32001 4.65997C7.94001 4.89997 6.63001 5.31997 5.40001 5.88997C2.92001 9.62997 2.25001 13.28 2.58001 16.87C4.23001 18.1 5.82001 18.84 7.39001 19.33C7.78001 18.8 8.12001 18.23 8.42001 17.64C7.85001 17.43 7.31001 17.16 6.80001 16.85C6.94001 16.75 7.07001 16.64 7.20001 16.54C10.33 18 13.72 18 16.81 16.54C16.94 16.65 17.07 16.75 17.21 16.85C16.7 17.16 16.15 17.42 15.59 17.64C15.89 18.23 16.23 18.8 16.62 19.33C18.19 18.84 19.79 18.1 21.43 16.87C21.82 12.7 20.76 9.08997 18.61 5.88997H18.59ZM8.84001 14.67C7.90001 14.67 7.13001 13.8 7.13001 12.73C7.13001 11.66 7.88001 10.79 8.84001 10.79C9.80001 10.79 10.56 11.66 10.55 12.73C10.55 13.79 9.80001 14.67 8.84001 14.67ZM15.15 14.67C14.21 14.67 13.44 13.8 13.44 12.73C13.44 11.66 14.19 10.79 15.15 10.79C16.11 10.79 16.87 11.66 16.86 12.73C16.86 13.79 16.11 14.67 15.15 14.67Z"
              fill="white"
            ></path>
          </svg>
        </a>
        <a
          href="https://github.com/Jones8683"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          class="nav-icon github-icon"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              fill="white"
            ></path>
          </svg>
        </a>
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
  backdrop-filter: blur(0px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized {
  top: 15px;
  width: 90%;
  max-width: 800px;
  background-color: rgba(22, 22, 22, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(132, 132, 132, 0.12);
  border-radius: 18px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.main-header[data-show="false"] {
  transform: translate(-50%, -120px);
}

.main-header[data-show="true"] {
  transform: translate(-50%, 0);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  transition: padding 0.5s ease;
}

.main-header.minimized .nav-container {
  padding: 2px 20px;
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
  text-decoration: none !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 0.85rem;
  font-weight: 400;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff !important;
  transform: translateY(-1px);
}

.nav-name-link {
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.3s ease;
}

.nav-name-link:hover {
  opacity: 0.75;
}

.nav-name {
  font-weight: 700;
  font-size: 1.4rem;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1;
}

.nav-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 999px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}

.nav-icon:hover {
  transform: translateY(-1px);
  background-color: rgba(148, 163, 184, 0.12);
}

.nav-icon svg {
  width: 26px;
  height: 26px;
  display: block;
}

.nav-left a,
.nav-item,
.nav-link-item {
  text-decoration: none !important;
}

@media (max-width: 650px) {
  .nav-name {
    display: none !important;
  }

  .nav-container {
    padding: 10px 16px !important;
    justify-content: space-between !important;
  }

  .nav-left {
    gap: 0 !important;
  }

  .glass-nav {
    gap: 8px !important;
  }

  .glass-btn {
    padding: 8px 14px !important;
    font-size: 0.8rem !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  .nav-right {
    gap: 12px !important;
  }

  .nav-icon svg {
    width: 22px !important;
    height: 22px !important;
  }
}
</style>
