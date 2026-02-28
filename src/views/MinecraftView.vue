<script setup>
import { ref } from "vue";

const serverIP = ref("mc.jonesjankovic.com");
const copyStatus = ref("Copy IP");

const mods = [
  "Iron's Spells 'n Spellbooks",
  "Trinkets and Baubles",
  "Yung's Better Series",
  "Project E",
  "Waystones",
  "Sophisticated Backpacks",
  "Tom's Simple Storage",
  "Cosmetic Armor",
  "Corpse Mod",
];

const copyToClipboard = () => {
  navigator.clipboard.writeText(serverIP.value);
  copyStatus.value = "Copied!";
  setTimeout(() => {
    copyStatus.value = "Copy IP";
  }, 2000);
};
</script>

<template>
  <div class="content-wrap mc-page">
    <h1
      class="name-title"
      style="
        margin-top: 20px !important;
        margin-bottom: 4px !important;
        font-size: 72px;
      "
    >
      Minecraft Server
    </h1>

    <p class="arcade-subtitle">
      Iron's Spells 'n Spellbooks | Modded 1.21.1 Java | Semi-Anarchy
    </p>

    <div class="ip-container">
      <code class="ip-text">{{ serverIP }}</code>
      <button @click="copyToClipboard" class="copy-pill">
        {{ copyStatus }}
      </button>
    </div>

    <div class="mc-content">
      <section class="info-block">
        <p class="description">
          A magic-focused survival experience built around
          <strong>Iron's Spells 'n Spellbooks</strong>. We are currently looking
          for new players to join our community! Master the arcane, test your
          skills, and build to your heart's content.
        </p>

        <a
          href="https://discord.gg/7CUxY6AWEP"
          target="_blank"
          class="solid-discord-btn"
        >
          <span class="btn-title">Join Discord to Whitelist</span>
          <span class="btn-desc">Apply and get started on the server</span>
        </a>
      </section>

      <div class="divider"></div>

      <section class="mod-section">
        <h2 class="section-label">Included Mods</h2>
        <div class="mod-grid">
          <span v-for="mod in mods" :key="mod" class="mod-tag">{{ mod }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mc-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.ip-container {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 6px 6px 20px;
  border-radius: 100px;
  margin-top: 15px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
}

.ip-text {
  font-family: "Satoshi", monospace;
  color: #87cefa;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.copy-pill {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid transparent;
  color: white;
  padding: 8px 20px;
  border-radius: 100px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.copy-pill:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.mc-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.info-block {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #cbd5f5;
  margin-bottom: 30px;
}

.solid-discord-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background-color: #5865f2;
  color: white;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 16px;
  transition: background-color 0.2s ease;
  border: 2px solid transparent;
}

.solid-discord-btn:hover {
  background-color: #4752c4;
}

.btn-title {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
}

.btn-desc {
  font-size: 0.85rem;
  color: #e3e5e8;
  font-weight: 400;
}

.divider {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.section-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.mod-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 700px;
}

.mod-tag {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.mod-tag:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

@media (max-width: 600px) {
  .ip-container {
    flex-direction: column;
    border-radius: 20px;
    padding: 20px;
    width: 90%;
  }
}
</style>
