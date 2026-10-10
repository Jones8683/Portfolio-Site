<script setup>
import { useWindowScroll } from '@vueuse/core';
import profilePic from '@/assets/kenobi.png';

definePage({ meta: { title: 'Home' } });

const { y } = useWindowScroll();

const interests = [
  {
    label: 'Hobbies',
    items: [
      { name: 'Piano' },
      { name: 'Electric guitar' },
      { name: 'Drawing' },
      { name: 'Lego' },
      { name: 'Photography' },
      { name: 'Cooking' },
      { name: 'Cats' },
      { name: 'Orienteering' },
      { name: 'Hiking' },
      { name: 'Running' },
      { name: 'Stargazing' },
    ],
  },
  {
    label: 'Music',
    items: [
      { name: 'Raye' },
      { name: 'Kendrick Lamar' },
      { name: 'Citizen The Artist' },
      { name: 'Tame Impala' },
      { name: 'Metro Boomin' },
      { name: 'Future' },
    ],
  },
  {
    label: 'Games',
    items: [
      { name: 'Minecraft' },
      { name: 'Hollow Knight' },
      { name: 'Silksong' },
      { name: 'Jedi Fallen Order' },
      { name: 'Jedi Survivor' },
      { name: 'Forza Horizon' },
      { name: 'Halo' },
      { name: 'Rainbow Six Siege' },
    ],
  },
  {
    label: 'Books & Shows',
    items: [
      { name: 'The High Republic' },
      { name: 'Keeper of the Lost Cities' },
      { name: 'The Martian' },
      { name: 'Project Hail Mary' },
      { name: 'The Rookie' },
      { name: 'Dune' },
      { name: 'Interstellar' },
      { name: 'Andor' },
      { name: 'Spider-Verse' },
    ],
  },
];

const palette = ['#b79cff', '#9a97ff', '#80b5ff', '#5fe3d6', '#86ebb0'];

const chipColor = (groupIndex, itemIndex) =>
  palette[(groupIndex * 3 + itemIndex * 2) % palette.length];

const contacts = [
  {
    label: 'Email',
    value: 'contact@jjank.com',
    href: 'mailto:contact@jjank.com',
    viewBox: '0 0 24 24',
    icon: 'M4.5 4.5h15A2.5 2.5 0 0 1 22 7v10a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17V7a2.5 2.5 0 0 1 2.5-2.5zM3 6.2l9 7.1 9-7.1',
    outline: true,
  },
  {
    label: 'Instagram',
    value: 'jonesjankovic',
    href: 'https://www.instagram.com/jonesjankovic',
    viewBox: '0 0 512 512',
    icon: 'M170.663 256.157c-.083-47.121 38.055-85.4 85.167-85.482 47.121-.092 85.407 38.029 85.499 85.159.091 47.13-38.047 85.4-85.176 85.492-47.112.09-85.399-38.039-85.49-85.169zm-46.108.092c.141 72.602 59.106 131.327 131.69 131.185 72.592-.14 131.35-59.089 131.209-131.691-.141-72.577-59.114-131.336-131.715-131.194-72.585.141-131.325 59.114-131.184 131.7zm237.104-137.092c.033 16.954 13.817 30.682 30.772 30.649 16.961-.034 30.689-13.811 30.664-30.765-.033-16.954-13.818-30.69-30.78-30.656-16.962.033-30.689 13.818-30.656 30.772zm-208.696 345.4c-24.958-1.086-38.511-5.234-47.543-8.709-11.961-4.628-20.496-10.177-29.479-19.093-8.966-8.951-14.532-17.461-19.202-29.397-3.508-9.033-7.73-22.569-8.9-47.527-1.269-26.983-1.559-35.078-1.683-103.433-.133-68.338.116-76.434 1.294-103.441 1.069-24.941 5.242-38.512 8.709-47.536 4.628-11.977 10.161-20.496 19.094-29.478 8.949-8.983 17.459-14.532 29.403-19.202 9.025-3.526 22.561-7.715 47.511-8.9 26.998-1.278 35.085-1.551 103.423-1.684 68.353-.133 76.448.108 103.456 1.294 24.94 1.086 38.51 5.217 47.527 8.709 11.968 4.628 20.503 10.145 29.478 19.094 8.974 8.95 14.54 17.443 19.21 29.413 3.524 8.999 7.714 22.552 8.892 47.494 1.285 26.998 1.576 35.094 1.7 103.432.132 68.355-.117 76.451-1.302 103.442-1.087 24.957-5.226 38.52-8.709 47.56-4.629 11.953-10.161 20.488-19.103 29.471-8.941 8.949-17.451 14.531-29.403 19.201-9.009 3.517-22.561 7.714-47.494 8.9-26.998 1.269-35.086 1.56-103.448 1.684-68.338.133-76.424-.124-103.431-1.294zM149.977 1.773c-27.239 1.286-45.843 5.648-62.101 12.019-16.829 6.561-31.095 15.353-45.286 29.603C28.381 57.653 19.655 71.944 13.144 88.79c-6.303 16.299-10.575 34.912-11.778 62.168C.172 178.264-.102 186.973.031 256.489c.133 69.508.439 78.234 1.741 105.548 1.302 27.231 5.649 45.827 12.019 62.092 6.569 16.83 15.353 31.089 29.611 45.289 14.25 14.2 28.55 22.918 45.404 29.438 16.282 6.294 34.902 10.583 62.15 11.777 27.305 1.203 36.022 1.468 105.521 1.336 69.532-.133 78.25-.44 105.555-1.734 27.239-1.302 45.826-5.664 62.1-12.019 16.829-6.585 31.095-15.353 45.288-29.611 14.191-14.251 22.917-28.55 29.428-45.404 6.304-16.282 10.592-34.904 11.777-62.134 1.195-27.323 1.478-36.049 1.344-105.557-.133-69.516-.447-78.225-1.741-105.522-1.294-27.256-5.657-45.844-12.019-62.118-6.577-16.829-15.352-31.08-29.602-45.288-14.25-14.192-28.55-22.935-45.404-29.429-16.29-6.304-34.903-10.6-62.15-11.778C333.747.164 325.03-.101 255.506.031c-69.507.133-78.224.431-105.529 1.742z',
  },
  {
    label: 'GitHub',
    value: 'Jones8683',
    href: 'https://github.com/Jones8683',
    viewBox: '0 0 24 24',
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    label: 'Xbox',
    value: 'TheAxisix',
    href: 'https://www.xbox.com/play/user/TheAxisix',
    viewBox: '0 0 32 32',
    icon: 'M16 5.425c-1.888-1.125-4.106-1.922-6.473-2.249l-0.092-0.010c-0.070-0.005-0.152-0.008-0.234-0.008-0.613 0-1.188 0.16-1.687 0.441l0.017-0.009c2.357-1.634 5.277-2.61 8.426-2.61 0.008 0 0.016 0 0.024 0h0.019c0.005 0 0.011 0 0.018 0 3.157 0 6.086 0.976 8.501 2.642l-0.050-0.033c-0.478-0.272-1.051-0.433-1.662-0.433-0.085 0-0.169 0.003-0.252 0.009l0.011-0.001c-2.459 0.336-4.677 1.13-6.648 2.297l0.082-0.045zM5.554 5.268c-0.041 0.014-0.077 0.032-0.11 0.054l0.002-0.001c-2.758 2.723-4.466 6.504-4.466 10.684 0 3.584 1.256 6.875 3.353 9.457l-0.022-0.028c-1.754-3.261 4.48-12.455 7.61-16.159-3.53-3.521-5.277-4.062-6.015-4.062-0.010-0-0.021-0.001-0.032-0.001-0.115 0-0.225 0.021-0.326 0.060l0.006-0.002zM20.083 9.275c3.129 3.706 9.367 12.908 7.605 16.161 2.075-2.554 3.332-5.845 3.332-9.43 0-4.181-1.709-7.962-4.467-10.684l-0.002-0.002c-0.029-0.021-0.063-0.039-0.1-0.052l-0.003-0.001c-0.1-0.036-0.216-0.056-0.336-0.056-0.005 0-0.011 0-0.016 0h0.001c-0.741-0-2.485 0.543-6.014 4.063zM6.114 27.306c2.627 2.306 6.093 3.714 9.888 3.714s7.261-1.407 9.905-3.728l-0.017 0.015c2.349-2.393-5.402-10.901-9.89-14.29-4.483 3.39-12.24 11.897-9.886 14.29z',
  },
  {
    label: 'Discord',
    value: 'Jones',
    href: 'https://discord.com/users/1537745548000497716',
    viewBox: '0 0 24 24',
    icon: 'M18.59 5.88997C17.36 5.31997 16.05 4.89997 14.67 4.65997C14.5 4.95997 14.3 5.36997 14.17 5.69997C12.71 5.47997 11.26 5.47997 9.83001 5.69997C9.69001 5.36997 9.49001 4.95997 9.32001 4.65997C7.94001 4.89997 6.63001 5.31997 5.40001 5.88997C2.92001 9.62997 2.25001 13.28 2.58001 16.87C4.23001 18.1 5.82001 18.84 7.39001 19.33C7.78001 18.8 8.12001 18.23 8.42001 17.64C7.85001 17.43 7.31001 17.16 6.80001 16.85C6.94001 16.75 7.07001 16.64 7.20001 16.54C10.33 18 13.72 18 16.81 16.54C16.94 16.65 17.07 16.75 17.21 16.85C16.7 17.16 16.15 17.42 15.59 17.64C15.89 18.23 16.23 18.8 16.62 19.33C18.19 18.84 19.79 18.1 21.43 16.87C21.82 12.7 20.76 9.08997 18.61 5.88997H18.59ZM8.84001 14.67C7.90001 14.67 7.13001 13.8 7.13001 12.73C7.13001 11.66 7.88001 10.79 8.84001 10.79C9.80001 10.79 10.56 11.66 10.55 12.73C10.55 13.79 9.80001 14.67 8.84001 14.67ZM15.15 14.67C14.21 14.67 13.44 13.8 13.44 12.73C13.44 11.66 14.19 10.79 15.15 10.79C16.11 10.79 16.87 11.66 16.86 12.73C16.86 13.79 16.11 14.67 15.15 14.67Z',
  },
];
</script>

<template>
  <div class="home">
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
          width="880"
          height="192"
          class="snake-image"
          fetchpriority="high"
          decoding="async"
        />
      </div>
    </div>

    <div class="scroll-cue" :class="{ hidden: y > 60 }">
      <div class="scroll-cue-bounce">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="rgba(255, 255, 255, 0.18)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <div class="content-wrap home-content">
      <section class="panel about-section">
        <div class="about-title">
          <h2>About</h2>
        </div>
        <div class="about-body">
          <p>
            Hi! I'm Jones, a student from Australia who loves learning new things and exploring in
            general. I'm somewhere between an introvert and an extrovert, and I'm always happy to
            chat.
          </p>
        </div>
      </section>

      <section class="panel about-section">
        <div class="about-title">
          <h2>Interests</h2>
        </div>
        <div class="about-body">
          <div v-for="(group, groupIndex) in interests" :key="group.label" class="interest-row">
            <span class="interest-label">{{ group.label }}</span>
            <ul class="interest-chips">
              <li
                v-for="(item, itemIndex) in group.items"
                :key="item.name"
                class="interest-chip"
                :style="{ '--chip-accent': chipColor(groupIndex, itemIndex) }"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="panel about-section">
        <div class="about-title">
          <h2>Contact</h2>
        </div>
        <div class="about-body">
          <p>Check out my socials to see what I'm up to:</p>
          <div class="contact-list">
            <a
              v-for="contact in contacts"
              :key="contact.label"
              :href="contact.href"
              :target="contact.href.startsWith('http') ? '_blank' : undefined"
              rel="noopener noreferrer"
              class="contact-row"
            >
              <svg
                class="contact-row-icon"
                :class="{ outline: contact.outline }"
                :viewBox="contact.viewBox"
                aria-hidden="true"
              >
                <path :d="contact.icon" />
              </svg>
              <span class="contact-row-label">{{ contact.label }}</span>
              <span class="contact-row-value">{{ contact.value }}</span>
              <svg class="contact-row-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 10h11m0 0-4-4m4 4-4 4"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </div>
          <p class="contact-outro">Feel free to reach out if you want to talk!</p>
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
  gap: 20px;
  padding: 4px 40px 0;
  min-height: calc(100svh - var(--nav-height));
}

.hero-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
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
  line-height: 1;
  text-align: center;
  background: linear-gradient(130deg, #80b5ff 0%, #6eeded 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-pill {
  padding: 6px 14px;
  border-radius: 100px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #64a8ff;
  background: rgba(58, 123, 213, 0.14);
  border: 1px solid rgba(58, 123, 213, 0.438);
}

.snake-wrap {
  width: min(100%, 900px);
  display: flex;
  justify-content: center;
  margin: -18px 0 8px;
  transition:
    opacity 0.7s ease 0.3s,
    transform 0.7s ease 0.3s;
}

.snake-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 16px 30px rgba(3, 6, 16, 0.5));
  opacity: 0.95;
}

.scroll-cue {
  position: fixed;
  bottom: 28px;
  left: 50%;
  z-index: 100;
  transform: translateX(-50%);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.scroll-cue.hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  pointer-events: none;
}

.scroll-cue-bounce {
  animation: bounce-cue 2s ease-in-out infinite;
}

.home-content {
  gap: 20px;
  margin-top: 24px;
  padding-bottom: 60px;
  transition:
    opacity 0.6s ease 0.5s,
    transform 0.6s ease 0.5s;
}

@starting-style {
  .hero-block,
  .snake-wrap,
  .home-content {
    opacity: 0;
    transform: translateY(20px);
  }
}

.about-section {
  width: 100%;
  margin-top: 20px;
  padding: 28px 32px;
  display: grid;
  grid-template-columns: minmax(140px, 200px) minmax(0, 1fr);
  gap: 24px;
  text-align: left;
}

.about-title h2 {
  font-size: clamp(1.5rem, 2vw, 1.9rem);
}

.about-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-body p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-soft);
}

.interest-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: baseline;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-glass-border);
}

.interest-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.interest-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-muted);
}

.interest-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.interest-chip {
  padding: 5px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-soft);
  background: color-mix(in srgb, var(--chip-accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-accent) 22%, transparent);
  border-radius: 100px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--color-glass-border);
  border-radius: 10px;
  overflow: hidden;
  min-width: 0;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.contact-row:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(135, 206, 250, 0.2);
  transform: translateX(4px);
}

.contact-row-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: #4a5e7a;
  fill: currentColor;
  transition: color 0.25s ease;
}

.contact-row-icon.outline {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.contact-row:hover .contact-row-icon {
  color: var(--color-accent);
}

.contact-row-label {
  min-width: 68px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-muted);
  transition: color 0.25s ease;
}

.contact-row:hover .contact-row-label {
  color: var(--color-text-soft);
}

.contact-row-value {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  color: var(--color-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-row-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #3a4f6a;
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    color 0.3s ease;
}

.contact-row:hover .contact-row-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-accent);
}

.contact-outro {
  margin-top: 12px;
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

@media (max-width: 720px) {
  .about-section {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 24px 18px;
  }

  .interest-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .interest-chips {
    justify-content: center;
  }

  .contact-row {
    gap: 10px;
    padding: 10px 12px;
  }

  .contact-row-label {
    min-width: 0;
  }

  .contact-row-value {
    font-size: 14px;
  }

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

@media (max-width: 420px) {
  .contact-row-value {
    display: none;
  }

  .contact-row-label {
    flex: 1;
  }
}
</style>
