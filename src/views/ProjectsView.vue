<script setup>
const projects = [
  {
    name: "BetterSEQTA+",
    description: "A redesigned SEQTA experience for students worldwide.",
    href: "https://github.com/BetterSEQTA/BetterSEQTA-Plus",
    logo: "https://github.com/BetterSEQTA.png",
    type: "Web Extension",
  },
  {
    name: "DesQTA",
    description:
      "A native desktop version of BetterSEQTA+ with a smoother workflow.",
    href: "https://github.com/BetterSEQTA/DesQTA",
    logo: "https://github.com/BetterSEQTA.png",
    type: "Desktop App",
  },
  {
    name: "Portfolio Site",
    description:
      "My personal portfolio website for projects, experiments, and games.",
    href: "https://github.com/Jones8683/Portfolio-Site",
    logo: "https://github.com/Jones8683.png",
    type: "Website",
  },
  {
    name: "Arduino Buzzer Music",
    description:
      "A software project featuring iconic melodies for Arduino piezo buzzers.",
    href: "https://github.com/Jones8683/Arduino-Buzzer-Music",
    logo: "https://github.com/Jones8683.png",
    type: "Software",
  },
];
</script>

<template>
  <section class="projects-page">
    <h1 class="name-title projects-title">Contributions &amp; Projects</h1>
    <p class="projects-subtitle">
      A collection of projects I have made or contributed to.
    </p>

    <div class="project-list">
      <article
        v-for="project in projects"
        :key="project.name"
        class="project-row"
      >
        <div class="project-main">
          <img
            :src="project.logo"
            :alt="project.name"
            class="project-logo"
            loading="lazy"
            decoding="async"
          />

          <div class="project-meta">
            <p class="project-kicker">{{ project.type }}</p>
            <h2 class="project-name">{{ project.name }}</h2>
            <p class="project-desc">{{ project.description }}</p>
          </div>
        </div>

        <a
          :href="project.href"
          target="_blank"
          rel="noopener noreferrer"
          class="project-btn"
        >
          <span class="project-btn-label">View Project</span>
          <svg
            class="project-btn-arrow"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 10h11m0 0-4-4m4 4-4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.projects-page {
  width: min(92%, 980px);
  padding: 12px 0 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.projects-title {
  margin-top: 12px;
  margin-bottom: 6px;
  font-size: clamp(2.2rem, 7vw, 3.8rem);
  line-height: 1;
  animation: pull-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.projects-subtitle {
  color: #94a3b8;
  font-size: 1.02rem;
  margin-bottom: 20px;
  text-align: center;
  animation: pull-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.06s;
}

.project-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.project-row {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-height: 220px;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  animation: pull-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.project-row:nth-child(1) {
  animation-delay: 0.18s;
}

.project-row:nth-child(2) {
  animation-delay: 0.24s;
}

.project-row:nth-child(3) {
  animation-delay: 0.3s;
}

.project-row:nth-child(4) {
  animation-delay: 0.36s;
}

.project-row:hover {
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 10px 24px rgba(3, 6, 16, 0.25);
  transform: translateY(-2px);
}

.project-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.project-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.project-meta {
  min-width: 0;
}

.project-kicker {
  margin: 0;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.project-name {
  margin: 3px 0 6px;
  color: #ffffff;
  font-size: 1.15rem;
  line-height: 1.25;
}

.project-desc {
  margin: 0;
  color: #cbd5f5;
  line-height: 1.55;
  font-size: 0.95rem;
}

.project-btn {
  margin-top: auto;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.025);
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.project-btn:visited {
  color: #94a3b8;
}

.project-btn:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(135, 206, 250, 0.2);
  transform: translateX(4px);
}

.project-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(135, 206, 250, 0.22);
}

.project-btn-label {
  min-width: 0;
  transition: color 0.25s ease;
}

.project-btn-arrow {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #3a4f6a;
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    color 0.25s ease;
}

.project-btn:hover .project-btn-label {
  color: #cbd5f5;
}

.project-btn:hover .project-btn-arrow {
  opacity: 1;
  transform: translateX(0);
  color: lightskyblue;
}

@keyframes pull-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .projects-title,
  .projects-subtitle,
  .project-row,
  .project-list {
    animation: none !important;
  }
}

@media (max-width: 860px) {
  .project-list {
    grid-template-columns: 1fr;
  }

  .project-row {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .projects-page {
    width: min(95%, 980px);
    padding-bottom: 44px;
  }
}
</style>
