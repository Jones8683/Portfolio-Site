<script setup>
import { ref } from "vue";

const serverIP = ref("mc.jonesjankovic.com");
const isCopied = ref(false);

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
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};
</script>

<template>
  <img src="/minecraft.png" class="mc-bg-overlay" alt="" />

  <div class="content-wrap mc-page">
    <h1
      class="name-title"
      style="margin-top: 20px !important; margin-bottom: 4px !important"
    >
      Minecraft Server
    </h1>

    <p class="arcade-subtitle">
      Iron's Spells 'n Spellbooks | Modded 1.21.1 Java | Semi-Anarchy
    </p>

    <div class="ip-container">
      <code class="ip-text">{{ serverIP }}</code>
      <button
        @click="copyToClipboard"
        class="copy-pill"
        :class="{ 'is-copied': isCopied }"
      >
        <span v-if="!isCopied">Copy IP</span>
        <span v-else class="success-text">
          <span class="green-dot"></span> Copied!
        </span>
      </button>
    </div>

    <div class="mc-content">
      <section class="info-block main-intro">
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

      <div class="two-col-grid">
        <section class="content-box">
          <h2 class="section-label">Server Features</h2>
          <ul class="clean-list">
            <li>Modded Survival Multiplayer as our main gamemode</li>
            <li>Regular events and competitions.</li>
            <li>Custom world generation to explore.</li>
            <li>Regular updates to keep things smooth.</li>
            <li>The End dimension will be enabled at an upcoming event!</li>
          </ul>
        </section>

        <section class="content-box">
          <h2 class="section-label">Included Mods</h2>
          <div class="mod-grid">
            <span v-for="mod in mods" :key="mod" class="mod-tag">{{
              mod
            }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc-bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  object-fit: cover;
  object-position: center top;
  opacity: 0.2;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 16%,
    black 35%,
    black 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 16%,
    black 35%,
    black 100%
  );
}

.mc-page.content-wrap {
  width: min(95%, 1000px) !important;
  max-width: 1000px !important;
  margin: 0 auto;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.name-title {
  font-size: 72px;
  line-height: 1.1;
  text-align: center;
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
  padding: 8px 0;
  border-radius: 100px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 110px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.copy-pill:hover:not(.is-copied) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.copy-pill.is-copied {
  background: rgba(46, 213, 115, 0.1);
  border-color: rgba(46, 213, 115, 0.3);
  color: #2ed573;
}

.success-text {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.2s ease-in-out;
}

.green-dot {
  width: 8px;
  height: 8px;
  background-color: #2ed573;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(46, 213, 115, 0.6);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.mc-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
}

.main-intro {
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

.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  align-items: stretch;
}

.content-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  text-align: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  clip-path: inset(0 round 20px);
  backface-visibility: hidden;
  transform: translateZ(0);
}

.clean-list {
  list-style: disc inside;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #cbd5f5;
  font-size: 0.95rem;
  text-align: left;
  margin: 0;
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

@media (max-width: 900px) {
  .two-col-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .name-title {
    font-size: 52px;
    line-height: 1.2;
  }

  .ip-container {
    flex-direction: column;
    border-radius: 20px;
    padding: 20px;
    width: 90%;
  }
}
</style>
