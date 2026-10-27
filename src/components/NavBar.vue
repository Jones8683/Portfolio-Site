<script setup>
import { computed, ref, watch } from 'vue';
import { useWindowScroll } from '@vueuse/core';

function toLetters(word) {
  return [...word].map((char, i) => ({ char, offset: i / (word.length - 1) }));
}

const jonesLetters = toLetters('ones');
const jankovicLetters = toLetters('ovic');

const { y } = useWindowScroll();
const isMinimized = computed(() => y.value > 20);
const shouldShow = ref(true);

watch(y, (now, prev) => {
  shouldShow.value = now < 350 || now < prev;
});
</script>

<template>
  <div class="nav-shell">
    <header class="main-header" :class="{ minimized: isMinimized, hidden: !shouldShow }">
      <div class="nav-left">
        <RouterLink class="nav-brand" to="/" aria-label="Jones Jankovic — Home">
          <span class="nav-name">
            <span class="name-anchor-first" aria-hidden="true">J</span>
            <span class="name-segment" aria-hidden="true">
              <span class="name-segment-text"
                ><span
                  v-for="{ char, offset } in jonesLetters"
                  :key="offset"
                  class="name-letter"
                  :style="{ '--offset': offset }"
                  >{{ char }}</span
                >&nbsp;</span
              >
            </span>
            <span class="name-anchor-second" aria-hidden="true">Jank</span>
            <span class="name-segment" aria-hidden="true">
              <span class="name-segment-text"
                ><span
                  v-for="{ char, offset } in jankovicLetters"
                  :key="offset"
                  class="name-letter"
                  :style="{ '--offset': offset }"
                  >{{ char }}</span
                ></span
              >
            </span>
          </span>
        </RouterLink>
        <nav class="glass-nav">
          <RouterLink class="glass-btn" active-class="active" to="/projects">Projects</RouterLink>
          <RouterLink class="glass-btn" active-class="active" to="/play">Arcade</RouterLink>
        </nav>
      </div>
      <div class="nav-actions">
        <a
          class="nav-icon"
          href="https://discord.com/users/1562426082185973802"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          class="nav-icon"
          href="https://github.com/Jones8683"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </header>
  </div>
</template>

<style scoped>
.nav-shell {
  position: fixed;
  top: 22px;
  left: 0;
  right: 0;
  z-index: 1000;
  width: min(100% - 32px, 1080px);
  margin-inline: auto;
  pointer-events: none;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 52px;
  padding: 6px 20px;
  border: 2px solid transparent;
  border-radius: 16px;
  pointer-events: auto;
  transition:
    margin-inline 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.main-header.minimized {
  padding-inline: 16px;
  background: #1d1d20;
  border-color: #313135;
  box-shadow:
    rgba(24, 24, 27, 0.08) 0 0 0 1px,
    rgba(39, 39, 42, 0.08) 0 10px 15px -3px,
    rgba(39, 39, 42, 0.08) 0 4px 6px -4px;
}

.main-header.hidden {
  transform: translateY(calc(-100% - 46px));
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
  transition: margin-inline-start 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized .nav-left {
  margin-inline-start: 8px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  transition:
    gap 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-inline-end 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.minimized .nav-actions {
  gap: 12px;
  margin-inline-end: 8px;
}

.glass-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  padding-block: 10px;
  margin-block: -10px;
}

.nav-name {
  position: relative;
  top: -2px;
  display: inline-flex;
  align-items: baseline;
  font-family: 'Cherry Bomb One', sans-serif;
  font-size: 27px;
  line-height: 1;
}

.name-anchor-first {
  margin-right: -0.09em;
}

.name-anchor-second {
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
}

.name-letter {
  opacity: 0;
  transition: opacity 0.14s ease;
}

.nav-brand:focus-visible .name-segment {
  grid-template-columns: 1fr;
}

.nav-brand:focus-visible .name-letter {
  opacity: 1;
  transition-delay: calc(var(--offset) * 120ms + 40ms);
}

.glass-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
}

.glass-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.glass-btn.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
}

.nav-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 29px;
  height: 29px;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.nav-icon:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

@media (width > 960px) {
  .main-header.minimized {
    margin-inline: 8%;
  }
}

@media (hover: hover) {
  .nav-brand:hover .name-segment {
    grid-template-columns: 1fr;
  }

  .nav-brand:hover .name-letter {
    opacity: 1;
    transition-delay: calc(var(--offset) * 120ms + 40ms);
  }
}

@media (width <= 720px) {
  .nav-shell {
    width: min(100% - 24px, 1080px);
  }

  .main-header {
    gap: 12px;
    padding-inline: 12px;
  }

  .nav-left {
    flex: 1;
    justify-content: space-between;
  }

  .nav-actions {
    display: none;
  }
}
</style>
