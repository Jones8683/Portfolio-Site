<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import profilePic from '@/assets/kenobi.png';

const visible = ref(false);
const scrolled = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 60;
};

onMounted(() => {
  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('scroll', handleScroll, { passive: true });
  requestAnimationFrame(() => {
    visible.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="home" :class="{ loaded: visible }">
    <div class="above-fold">
      <div class="hero-block">
        <div class="avatar-wrap">
          <div class="avatar-ring ring-1"></div>
          <div class="avatar-ring ring-2"></div>
          <img :src="profilePic" class="avatar-img" alt="Jones Jankovic" />
          <div class="avatar-glow"></div>
        </div>

        <h1 class="name-title">Jones Jankovic</h1>

        <div class="status-pill">Student | Australia</div>
      </div>

      <div class="snake-wrap">
        <img
          src="https://raw.githubusercontent.com/jones8683/jones8683/output/github-contribution-grid-snake-dark.svg"
          alt="GitHub contribution snake"
          class="snake-image"
          fetchpriority="high"
          decoding="async"
        />
      </div>
    </div>

    <div
      class="scroll-cue"
      :style="{
        opacity: scrolled ? 0 : 1,
        transform: scrolled
          ? 'translateX(-50%) translateY(-20px)'
          : 'translateX(-50%) translateY(0px)',
        pointerEvents: scrolled ? 'none' : 'auto',
      }"
    >
      <div class="scroll-cue-bounce">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 9l6 6 6-6"
            stroke="rgba(255,255,255,0.18)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <div class="content-wrap">
      <section class="about-section">
        <div class="about-title">
          <h2>About</h2>
        </div>
        <div class="about-body">
          <p>
            Hi! I'm Jones, a student based in Adelaide with a passion for technology, nature, and
            art. I play piano and electric guitar, run with the Tjuringa Orienteers, and love
            listening to music from artists like Future, Metro Boomin, and Kendrick Lamar.
          </p>
          <p>
            I love reading all kinds of books, especially The High Republic series, Keeper of the
            Lost Cities, and Tom Clancy's John Clark novels. My favorite movies and shows include
            Star Wars, the Dune films, Andor, and The Rookie. My top video games are Minecraft,
            Hollow Knight, Jedi Survivor, Halo, and Rainbow Six Siege.
          </p>
        </div>
      </section>

      <section class="about-section">
        <div class="about-title">
          <h2>Contact</h2>
        </div>
        <div class="about-body">
          <p>Want to get in touch? Reach out via email or check out my socials:</p>
          <div class="contact-list">
            <a href="mailto:contact@jjank.com" class="contact-row">
              <svg class="contact-row-icon" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M2 7l10 6 10-6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="contact-row-label">Email</span>
              <span class="contact-row-value">contact@jjank.com</span>
              <span class="contact-row-arrow">→</span>
            </a>

            <a
              href="https://github.com/Jones8683"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-row"
            >
              <svg class="contact-row-icon" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  fill="currentColor"
                />
              </svg>
              <span class="contact-row-label">GitHub</span>
              <span class="contact-row-value">Jones8683</span>
              <span class="contact-row-arrow">→</span>
            </a>

            <a
              href="https://www.xbox.com/play/user/TheAxisix"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-row"
            >
              <svg class="contact-row-icon" viewBox="0 0 32 32">
                <path
                  d="M16 5.425c-1.888-1.125-4.106-1.922-6.473-2.249l-0.092-0.010c-0.070-0.005-0.152-0.008-0.234-0.008-0.613 0-1.188 0.16-1.687 0.441l0.017-0.009c2.357-1.634 5.277-2.61 8.426-2.61 0.008 0 0.016 0 0.024 0h0.019c0.005 0 0.011 0 0.018 0 3.157 0 6.086 0.976 8.501 2.642l-0.050-0.033c-0.478-0.272-1.051-0.433-1.662-0.433-0.085 0-0.169 0.003-0.252 0.009l0.011-0.001c-2.459 0.336-4.677 1.13-6.648 2.297l0.082-0.045zM5.554 5.268c-0.041 0.014-0.077 0.032-0.11 0.054l0.002-0.001c-2.758 2.723-4.466 6.504-4.466 10.684 0 3.584 1.256 6.875 3.353 9.457l-0.022-0.028c-1.754-3.261 4.48-12.455 7.61-16.159-3.53-3.521-5.277-4.062-6.015-4.062-0.010-0-0.021-0.001-0.032-0.001-0.115 0-0.225 0.021-0.326 0.060l0.006-0.002zM20.083 9.275c3.129 3.706 9.367 12.908 7.605 16.161 2.075-2.554 3.332-5.845 3.332-9.43 0-4.181-1.709-7.962-4.467-10.684l-0.002-0.002c-0.029-0.021-0.063-0.039-0.1-0.052l-0.003-0.001c-0.1-0.036-0.216-0.056-0.336-0.056-0.005 0-0.011 0-0.016 0h0.001c-0.741-0-2.485 0.543-6.014 4.063zM6.114 27.306c2.627 2.306 6.093 3.714 9.888 3.714s7.261-1.407 9.905-3.728l-0.017 0.015c2.349-2.393-5.402-10.901-9.89-14.29-4.483 3.39-12.24 11.897-9.886 14.29z"
                  fill="currentColor"
                />
              </svg>
              <span class="contact-row-label">Xbox</span>
              <span class="contact-row-value">TheAxisix</span>
              <span class="contact-row-arrow">→</span>
            </a>

            <a
              href="https://discord.com/users/1537745548000497716"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-row"
            >
              <svg class="contact-row-icon" viewBox="0 0 24 24">
                <path
                  d="M18.59 5.88997C17.36 5.31997 16.05 4.89997 14.67 4.65997C14.5 4.95997 14.3 5.36997 14.17 5.69997C12.71 5.47997 11.26 5.47997 9.83001 5.69997C9.69001 5.36997 9.49001 4.95997 9.32001 4.65997C7.94001 4.89997 6.63001 5.31997 5.40001 5.88997C2.92001 9.62997 2.25001 13.28 2.58001 16.87C4.23001 18.1 5.82001 18.84 7.39001 19.33C7.78001 18.8 8.12001 18.23 8.42001 17.64C7.85001 17.43 7.31001 17.16 6.80001 16.85C6.94001 16.75 7.07001 16.64 7.20001 16.54C10.33 18 13.72 18 16.81 16.54C16.94 16.65 17.07 16.75 17.21 16.85C16.7 17.16 16.15 17.42 15.59 17.64C15.89 18.23 16.23 18.8 16.62 19.33C18.19 18.84 19.79 18.1 21.43 16.87C21.82 12.7 20.76 9.08997 18.61 5.88997H18.59ZM8.84001 14.67C7.90001 14.67 7.13001 13.8 7.13001 12.73C7.13001 11.66 7.88001 10.79 8.84001 10.79C9.80001 10.79 10.56 11.66 10.55 12.73C10.55 13.79 9.80001 14.67 8.84001 14.67ZM15.15 14.67C14.21 14.67 13.44 13.8 13.44 12.73C13.44 11.66 14.19 10.79 15.15 10.79C16.11 10.79 16.87 11.66 16.86 12.73C16.86 13.79 16.11 14.67 15.15 14.67Z"
                  fill="currentColor"
                />
              </svg>
              <span class="contact-row-label">Discord</span>
              <span class="contact-row-value">Jones</span>
              <span class="contact-row-arrow">→</span>
            </a>
          </div>
          <p style="margin-top: 12px">Feel free to reach out if you want to talk!</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.above-fold {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding: 4px 40px 0;
  box-sizing: border-box;
  min-height: calc(100vh - var(--nav-height));
}

.hero-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.loaded .hero-block {
  opacity: 1;
  transform: translateY(0);
}

.avatar-wrap {
  position: relative;
  width: 190px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.12);
  position: relative;
  z-index: 2;
  box-shadow: 0 0 40px rgba(58, 123, 213, 0.3);
}

.avatar-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid transparent;
  animation: spin-ring linear infinite;
}

.ring-1 {
  width: 165px;
  height: 165px;
  border-color: rgba(90, 158, 255, 0.35) rgba(90, 158, 255, 0.05) rgba(90, 158, 255, 0.05)
    rgba(90, 158, 255, 0.35);
  animation-duration: 8s;
}

.ring-2 {
  width: 185px;
  height: 185px;
  border-color: rgba(21, 224, 214, 0.15) rgba(21, 224, 214, 0.04);
  animation-duration: 14s;
  animation-direction: reverse;
}

.avatar-glow {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(58, 123, 213, 0.25) 0%, transparent 70%);
  z-index: 1;
  animation: glow-pulse 3s ease-in-out infinite;
}

.name-title {
  margin-bottom: 6px;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  text-align: center;
  background: linear-gradient(130deg, #5a9eff 0%, #15e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-pill {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #64a8ff;
  background: rgba(58, 123, 213, 0.14);
  border: 1px solid rgba(58, 123, 213, 0.438);
}

.snake-wrap {
  width: min(100%, 900px);
  margin-top: -18px;
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.7s ease 0.3s,
    transform 0.7s ease 0.3s;
}

.loaded .snake-wrap {
  opacity: 1;
  transform: translateY(0);
}

.snake-image {
  width: 100%;
}

.scroll-cue {
  position: fixed;
  bottom: 28px;
  left: 50%;
  z-index: 100;
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.scroll-cue-bounce {
  animation: bounce-cue 2s ease-in-out infinite;
}

.content-wrap {
  gap: 20px;
  margin-top: 24px;
  padding-bottom: 60px;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease 0.5s,
    transform 0.6s ease 0.5s;
}

.loaded .content-wrap {
  opacity: 1;
  transform: translateY(0);
}

@keyframes spin-ring {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes bounce-cue {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@media (max-width: 700px) {
  .above-fold {
    padding: 32px 20px 16px;
  }

  .name-title {
    font-size: clamp(30px, 8vw, 44px);
  }

  .avatar-img {
    width: 110px;
    height: 110px;
  }

  .ring-1 {
    width: 128px;
    height: 128px;
  }

  .ring-2 {
    width: 145px;
    height: 145px;
  }

  .avatar-wrap {
    width: 160px;
    height: 160px;
  }
}
</style>
