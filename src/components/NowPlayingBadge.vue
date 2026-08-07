<script setup>
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from "vue";
import { useNowPlaying } from "@/composables/useNowPlaying";

const props = defineProps({
  fallbackText: {
    type: String,
    default: "",
  },
});

const { track, startPolling, stopPolling } = useNowPlaying();

const badgeKey = computed(() => (track.value ? "track" : "fallback"));
const badgeRef = ref(null);

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling();
    return;
  }
  startPolling();
}

watch(
  () => track.value,
  (newTrack, oldTrack) => {
    const el = badgeRef.value;
    if (!el || !oldTrack || !newTrack) return;

    const startWidth = el.getBoundingClientRect().width;

    nextTick(() => {
      const endWidth = el.getBoundingClientRect().width;
      if (Math.abs(endWidth - startWidth) < 1) return;

      el.style.transition = "none";
      el.style.width = `${startWidth}px`;
      void el.offsetWidth;

      requestAnimationFrame(() => {
        el.style.transition = "width 0.35s ease, background 0.2s ease";
        el.style.width = `${endWidth}px`;
      });

      const clearInlineWidth = (event) => {
        if (event.propertyName !== "width") return;
        el.style.transition = "";
        el.style.width = "";
        el.removeEventListener("transitionend", clearInlineWidth);
      };
      el.addEventListener("transitionend", clearInlineWidth);
    });
  },
);

onMounted(() => {
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
    <Transition name="np-fade" mode="out-in">
      <a
        v-if="track"
        ref="badgeRef"
        :key="badgeKey"
        href="https://spotiqueue.com/mwrrowv"
        target="_blank"
        rel="noopener noreferrer"
        class="now-playing-badge"
        :aria-label="`Now playing: ${track.title} by ${track.artist}`"
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

      <div
        v-else-if="props.fallbackText"
        key="fallback"
        class="now-playing-badge fallback-pill"
      >
        {{ props.fallbackText }}
      </div>
    </Transition>
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
  height: var(--peak);
  background: #64a8ff;
  border-radius: 999px;
  transform-origin: center;
  will-change: transform;
  animation: np-bounce 1.1s linear infinite;
}

.np-bars span:nth-child(1) {
  --peak: 6px;
  animation-delay: -0.6s;
}
.np-bars span:nth-child(2) {
  --peak: 10px;
  animation-delay: -0.3s;
}
.np-bars span:nth-child(3) {
  --peak: 6px;
  animation-delay: 0s;
}

@keyframes np-bounce {
  0%,
  100% {
    transform: scaleY(0.45);
  }
  10% {
    transform: scaleY(0.52);
  }
  20% {
    transform: scaleY(0.64);
  }
  30% {
    transform: scaleY(0.79);
  }
  40% {
    transform: scaleY(0.92);
  }
  50% {
    transform: scaleY(1);
  }
  60% {
    transform: scaleY(0.9);
  }
  70% {
    transform: scaleY(0.72);
  }
  75% {
    transform: scaleY(0.65);
  }
  85% {
    transform: scaleY(0.55);
  }
  90% {
    transform: scaleY(0.5);
  }
}

.np-fade-enter-active,
.np-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.np-fade-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

.np-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
