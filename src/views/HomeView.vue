<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import profilePic from "@/assets/github.png";

const visible = ref(false);
const scrolled = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 60;
};

onMounted(() => {
  if (history.scrollRestoration) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  window.addEventListener("scroll", handleScroll, { passive: true });
  requestAnimationFrame(() => {
    visible.value = true;
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
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

        <div class="hero-tag">Student | Australia</div>

        <div class="hero-divider"></div>
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

      <div class="scroll-cue" :class="{ hidden: scrolled }">
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
            I'm Jones, a student with a strong interest in technology and
            computing. I enjoy learning how things work and continuously
            improving my skills. I love exploring artificial intelligence and
            discovering and testing the latest advancements in it. I enjoy
            experimenting with new software, and using technology to creatively
            build, improve, or just figure things out.
          </p>
          <p>
            I've done a bit of work on a few projects including
            <a
              href="https://github.com/BetterSEQTA/BetterSEQTA-Plus"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-link"
              >BetterSEQTA+</a
            >, a web extension for SEQTA that improves and reimagines user
            experience for over 60,000 students across the world.
          </p>
          <p>
            Beyond technology, I'm passionate about music, I love many kinds of
            music and I play the piano. Some of my favorite TV shows are Star
            Wars and Loki. I love reading all kinds of books, especially The
            High Republic series, and my favorite video games are Hollow Knight,
            Minecraft, and the Forza Horizon series.
          </p>
        </div>
      </section>

      <section class="about-section">
        <div class="about-title">
          <h2>Contact</h2>
        </div>
        <div class="about-body">
          <p>
            Want to get in touch? Reach out via email or check out my socials:
          </p>
          <div class="contact-list">
            <a href="mailto:jones@jonesjankovic.com" class="contact-row">
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
              <span class="contact-row-value">jones@jonesjankovic.com</span>
              <span class="contact-row-arrow">→</span>
            </a>
            <a
              href="https://discord.com/users/1378992101970280471"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-row"
            >
              <svg class="contact-row-icon" viewBox="0 0 24 24">
                <path
                  d="M18.59 5.89C17.36 5.32 16.05 4.9 14.67 4.66c-.17.3-.37.71-.5 1.04-1.46-.22-2.91-.22-4.34 0-.14-.33-.34-.74-.51-1.04-1.38.24-2.69.66-3.92 1.23C2.92 9.63 2.25 13.28 2.58 16.87c1.65 1.23 3.24 1.97 4.81 2.46.39-.53.73-1.1 1.03-1.69-.56-.21-1.1-.48-1.61-.79.14-.1.27-.21.4-.31 3.13 1.46 6.52 1.46 9.61 0 .13.11.26.21.4.31-.51.31-1.05.58-1.61.79.3.59.64 1.16 1.03 1.69 1.57-.49 3.17-1.23 4.81-2.46.39-4.17-.67-7.78-2.82-10.98zM8.84 14.67c-1.17 0-2.13-.99-2.13-2.21s.94-2.21 2.13-2.21 2.13.99 2.12 2.21-.94 2.21-2.12 2.21zm6.31 0c-1.17 0-2.13-.99-2.13-2.21s.94-2.21 2.13-2.21 2.13.99 2.12 2.21-.94 2.21-2.12 2.21z"
                  fill="currentColor"
                />
              </svg>
              <span class="contact-row-label">Discord</span>
              <span class="contact-row-value">Jones8683</span>
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
          </div>
          <p style="margin-top: 12px">
            Feel free to reach out if you want to talk!
          </p>
        </div>
      </section>

      <section class="about-section">
        <div class="about-title">
          <h2>Contributions &amp; Projects</h2>
        </div>
        <div class="about-body">
          <div class="repo-button-grid">
            <a
              href="https://github.com/BetterSEQTA/BetterSEQTA-Plus"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-btn"
            >
              <img
                src="https://github.com/BetterSEQTA.png"
                alt=""
                class="repo-logo"
                decoding="async"
              />
              <div class="repo-info">
                <span class="repo-btn-name">BetterSEQTA+</span>
                <p class="repo-desc">
                  Reimagining the SEQTA experience for students worldwide
                </p>
              </div>
              <span class="repo-arrow">→</span>
            </a>
            <a
              href="https://github.com/BetterSEQTA/DesQTA"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-btn"
            >
              <img
                src="https://github.com/BetterSEQTA.png"
                alt=""
                class="repo-logo"
                decoding="async"
              />
              <div class="repo-info">
                <span class="repo-btn-name">DesQTA</span>
                <p class="repo-desc">
                  Bringing BetterSEQTA+ functionality to the native desktop
                </p>
              </div>
              <span class="repo-arrow">→</span>
            </a>
            <a
              href="https://github.com/Jones8683/Portfolio-Site"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-btn"
            >
              <img
                src="https://github.com/Jones8683.png"
                alt=""
                class="repo-logo"
                decoding="async"
              />
              <div class="repo-info">
                <span class="repo-btn-name">Portfolio Site</span>
                <p class="repo-desc">
                  This very website — a showcase of my skills, interests, and
                  projects
                </p>
              </div>
              <span class="repo-arrow">→</span>
            </a>
            <a
              href="https://github.com/Jones8683/Arduino-Buzzer-Music"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-btn"
            >
              <img
                src="https://github.com/Jones8683.png"
                alt=""
                class="repo-logo"
                decoding="async"
              />
              <div class="repo-info">
                <span class="repo-btn-name">Arduino Buzzer Music</span>
                <p class="repo-desc">
                  A small collection of iconic tunes for an Arduino piezo buzzer
                </p>
              </div>
              <span class="repo-arrow">→</span>
            </a>
          </div>
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
  min-height: calc(100vh - 160px);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding: 4px 40px 0;
  box-sizing: border-box;
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
  border-color: rgba(90, 158, 255, 0.35) rgba(90, 158, 255, 0.05)
    rgba(90, 158, 255, 0.05) rgba(90, 158, 255, 0.35);
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
  background: radial-gradient(
    circle,
    rgba(58, 123, 213, 0.25) 0%,
    transparent 70%
  );
  z-index: 1;
  animation: glow-pulse 3s ease-in-out infinite;
}

.name-title {
  margin: 0;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  text-align: center;
  background: linear-gradient(135deg, #5a9eff 0%, #15e0d6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64a8ff;
  letter-spacing: 0.04em;
  background: rgba(58, 123, 213, 0.1);
  border: 1px solid rgba(58, 123, 213, 0.25);
  padding: 6px 14px;
  border-radius: 100px;
}

.hero-divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #5a9eff, rgba(21, 224, 214, 0.5));
  border-radius: 2px;
}

.snake-wrap {
  width: min(100%, 900px);
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
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.5s ease;
  padding-bottom: 4px;
  margin-top: auto;
}

.scroll-cue.hidden {
  opacity: 0;
  pointer-events: none;
}

.scroll-cue svg {
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
    opacity: 0.6;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
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

  .about-section .repo-button-grid {
    grid-template-columns: 1fr;
  }
}
</style>
