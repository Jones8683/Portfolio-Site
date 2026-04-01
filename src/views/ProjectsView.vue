<script setup>
import { computed, ref } from "vue";

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

const searchQuery = ref("");

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return projects;
  }

  return projects.filter((project) => {
    const text = `${project.name} ${project.description} ${project.type}`;
    return text.toLowerCase().includes(query);
  });
});
</script>

<template>
  <section class="projects-page">
    <h1 class="name-title projects-title">Contributions &amp; Projects</h1>
    <p class="projects-subtitle">
      A collection of projects I have made and contributed to.
    </p>

    <div class="projects-tools">
      <div class="search-box">
        <label for="project-search" class="sr-only">Search projects</label>
        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" stroke-width="2"></circle>
          <path
            d="m21 21-4.35-4.35"
            stroke-width="2"
            stroke-linecap="round"
          ></path>
        </svg>
        <input
          id="project-search"
          v-model="searchQuery"
          name="project-search"
          type="search"
          placeholder="Search projects"
          class="search-input"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="project-list">
      <article
        v-for="project in filteredProjects"
        :key="project.name"
        class="project-row"
      >
        <div class="project-main">
          <img :src="project.logo" :alt="project.name" class="project-logo" />

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

    <div v-if="filteredProjects.length === 0" class="no-results">
      <p>No projects match your search.</p>
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

.projects-tools {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  animation: pull-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: 0.12s;
}

.search-box {
  position: relative;
  width: min(100%, 560px);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 14px 0 40px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #f8fafc;
  font-size: 0.95rem;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  border-color: rgba(148, 163, 184, 0.45);
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
  border: 1px solid rgba(90, 158, 255, 0.45);
  border-radius: 10px;
  padding: 10px 12px;
  background: rgba(90, 158, 255, 0.09);
  color: #8fbeff;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.project-btn:hover {
  background: #5a9eff;
  border-color: #5a9eff;
  color: #ffffff;
  transform: translateY(-1px);
}

.project-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(90, 158, 255, 0.3);
}

.project-btn-label {
  transition: transform 0.22s ease;
}

.project-btn-arrow {
  width: 15px;
  height: 15px;
  opacity: 0.8;
  transform: translateX(0);
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.project-btn:hover .project-btn-label {
  transform: translateX(-1px);
}

.project-btn:hover .project-btn-arrow {
  opacity: 1;
  transform: translateX(3px);
}

.no-results {
  margin-top: 18px;
  text-align: center;
  color: #94a3b8;
  animation: pull-up 0.45s ease both;
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
  .projects-tools,
  .project-row,
  .no-results {
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

  .project-btn {
    text-align: center;
  }
}
</style>
