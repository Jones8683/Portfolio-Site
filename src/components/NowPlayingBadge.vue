<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  fallbackText: {
    type: String,
    default: "",
  },
});

const track = ref(null);
let pollTimer = null;
let isFetching = false;

async function fetchNowPlaying() {
  if (isFetching) return;
  isFetching = true;

  try {
    const res = await fetch("/api/now-playing");
    if (!res.ok) {
      track.value = null;
      return;
    }

    const data = await res.json();
    track.value = data.isPlaying ? data : null;
  } catch {
    track.value = null;
  } finally {
    isFetching = false;
  }
}

function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(fetchNowPlaying, 2000);
}

function stopPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling();
    return;
  }

  fetchNowPlaying();
  startPolling();
}

onMounted(() => {
  fetchNowPlaying();
  startPolling();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  stopPolling();
});
</script>

<template>
  <div class="badge-slot">
    <a
      v-if="track"
      :href="track.songUrl ?? undefined"
      target="_blank"
      rel="noopener noreferrer"
      class="now-playing-badge"
    >
      <img
        v-if="track.albumArt"
        :src="track.albumArt"
        class="np-art"
        :alt="track.album ?? 'Album art'"
      />
      <div class="np-text">
        <div class="np-label">
          <span class="np-bars" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          Listening to Spotify
        </div>
        <div class="np-track">{{ track.title }} - {{ track.artist }}</div>
      </div>
    </a>
    <div v-else-if="props.fallbackText" class="now-playing-badge fallback-pill">
      {{ props.fallbackText }}
    </div>
  </div>
</template>

<style scoped>
.badge-slot {
  height: 52px;
  display: flex;
  align-items: flex-start;
}

.now-playing-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 8px;
  border-radius: 6px;
  background: rgba(58, 123, 213, 0.14);
  border: 1px solid rgba(58, 123, 213, 0.438);
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease;
  max-width: min(90vw, 320px);
}

.now-playing-badge:not(.fallback-pill):hover {
  background: rgba(58, 123, 213, 0.18);
}

.fallback-pill {
  padding: 6px 14px;
  border-radius: 100px;
  max-width: none;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #64a8ff;
}

.np-art {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.np-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.np-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #64a8ff;
}

.np-track {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 10px;
}

.np-bars span {
  width: 2px;
  background: #64a8ff;
  border-radius: 1px;
  transform-origin: center;
  animation: np-bounce 0.9s ease-in-out infinite;
}

.np-bars span:nth-child(1) {
  height: 6px;
  animation-delay: -0.2s;
}
.np-bars span:nth-child(2) {
  height: 10px;
  animation-delay: 0s;
}
.np-bars span:nth-child(3) {
  height: 6px;
  animation-delay: -0.2s;
}

@keyframes np-bounce {
  0%,
  100% {
    transform: scaleY(0.45);
  }
  50% {
    transform: scaleY(1);
  }
  75% {
    transform: scaleY(0.65);
  }
}
</style>
