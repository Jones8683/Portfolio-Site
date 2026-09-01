<script setup>
const projects = [
  {
    name: 'BetterSEQTA+',
    description:
      'Redesigning SEQTA with custom themes, live wallpapers, and quality-of-life upgrades.',
    href: 'https://github.com/BetterSEQTA/BetterSEQTA-Plus',
    logo: 'https://github.com/BetterSEQTA.png',
    type: 'Web Extension',
  },
  {
    name: 'DesQTA',
    description: 'A powerful desktop app for SEQTA Learn, right on your computer.',
    href: 'https://github.com/BetterSEQTA/DesQTA',
    logo: 'https://github.com/BetterSEQTA.png',
    type: 'Desktop App',
  },
  {
    name: 'Portfolio Site',
    description: 'This very site - my home for projects, experiments, and games.',
    href: 'https://github.com/Jones8683/Portfolio-Site',
    logo: 'https://github.com/Jones8683.png',
    type: 'Website',
  },
  {
    name: 'Arduino Buzzer Music',
    description: 'A collection of songs created to be played on an Arduino piezo buzzer.',
    href: 'https://github.com/Jones8683/Arduino-Buzzer-Music',
    logo: 'https://github.com/Jones8683.png',
    type: 'Software',
  },
];
</script>

<template>
  <section class="content-wrap projects-page">
    <h1 class="name-title projects-title">Projects</h1>
    <p class="projects-subtitle">A collection of projects I have made and contributed to.</p>

    <div class="project-panel">
      <a
        v-for="(project, index) in projects"
        :key="project.name"
        :href="project.href"
        target="_blank"
        rel="noopener noreferrer"
        class="project-row"
        :style="{ animationDelay: `${0.3 + index * 0.07}s` }"
      >
        <span class="project-row-bar" aria-hidden="true"></span>
        <span class="project-row-inner">
          <img
            :src="project.logo"
            :alt="project.name"
            class="project-logo"
            loading="lazy"
            decoding="async"
          />
          <span class="project-info">
            <span class="project-name">{{ project.name }}</span>
            <span class="project-desc">{{ project.description }}</span>
          </span>
          <svg class="project-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10h11m0 0-4-4m4 4-4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.projects-page {
  width: min(92%, 840px);
  padding: 0 0 56px;
}

.projects-title {
  margin-top: 20px;
  margin-bottom: 16px;
  font-size: 72px;
}

.projects-subtitle {
  color: #94a3b8;
  font-size: 1.02rem;
  margin-top: 0;
  margin-bottom: 8px;
  text-align: center;
}

.project-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  padding: 4px 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 24px 50px rgba(4, 6, 16, 0.45);
}

.project-row {
  position: relative;
  display: flex;
  padding: 22px 4px;
  text-decoration: none;
  color: inherit;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  animation: pull-up 0.4s ease both;
}

.project-row:last-child {
  border-bottom: none;
}

.project-row:focus-visible {
  outline: none;
  border-radius: 12px;
  box-shadow: 0 0 0 3px rgba(135, 206, 250, 0.22);
}

.project-row-inner {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  min-width: 0;
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.project-row:hover .project-row-inner {
  transform: translateX(16px);
}

.project-row-bar {
  position: absolute;
  left: -14px;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 2px;
  background: #ffffff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-row:hover .project-row-bar {
  opacity: 1;
}

.project-logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  will-change: transform;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.project-row:hover .project-logo {
  transform: rotate(-8deg) scale(1.05);
}

.project-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.project-desc {
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.project-row:hover .project-desc {
  color: #cbd5f5;
}

.project-arrow {
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
  margin-right: 24px;
}

.project-row:hover .project-arrow {
  opacity: 1;
  transform: translateX(0);
  color: lightskyblue;
}

@keyframes pull-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-row,
  .project-logo {
    animation: none;
    transform: none;
    opacity: 1;
  }
}

@media (max-width: 860px) {
  .projects-title {
    line-height: 1.15;
  }
}

@media (max-width: 640px) {
  .projects-page {
    width: min(95%, 840px);
    padding-bottom: 44px;
  }
  .project-panel {
    padding: 4px 18px;
  }
  .project-row {
    padding: 18px 2px;
  }
  .project-row-inner {
    gap: 14px;
  }
  .project-row:hover .project-row-inner {
    transform: translateX(12px);
  }
  .project-row-bar {
    left: -10px;
  }
  .project-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
}

@media (max-width: 420px) {
  .project-arrow {
    display: none;
  }
}
</style>
