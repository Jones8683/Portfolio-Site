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
const measureTrackRef = ref(null);
const measureArt = ref(false);
const measureCandidateText = ref("");

const display = ref({
  title: "",
  artistLine: "",
  albumArt: null,
  album: null,
});

const fullArtistLabel = computed(() => {
  const artists = track.value?.artists;
  return Array.isArray(artists) && artists.length
    ? artists.join(", ")
    : "Unknown artist";
});

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling();
    return;
  }
  startPolling();
}

async function resolveDisplayArtists(currentTrack) {
  const artists = Array.isArray(currentTrack.artists)
    ? currentTrack.artists
    : [];
  if (!artists.length) return "";

  measureArt.value = Boolean(currentTrack.albumArt);

  for (let count = artists.length; count >= 1; count -= 1) {
    const candidateArtists = artists.slice(0, count).join(", ");
    measureCandidateText.value = `${currentTrack.title} - ${candidateArtists}`;
    await nextTick();

    const measureEl = measureTrackRef.value;
    if (measureEl && measureEl.scrollWidth <= measureEl.clientWidth + 0.5) {
      return candidateArtists;
    }
  }

  return artists[0];
}

async function resolveDisplay(currentTrack) {
  const artistLine = await resolveDisplayArtists(currentTrack);
  return {
    title: currentTrack.title,
    artistLine,
    albumArt: currentTrack.albumArt ?? null,
    album: currentTrack.album ?? null,
  };
}

function animateWidthChange(el, startWidth) {
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
}

watch(
  () => track.value,
  async (newTrack, oldTrack) => {
    if (!newTrack) {
      display.value = {
        title: "",
        artistLine: "",
        albumArt: null,
        album: null,
      };
      return;
    }

    const isSongSwap = Boolean(oldTrack);
    const el = badgeRef.value;
    const startWidth = isSongSwap && el ? el.getBoundingClientRect().width : 0;

    display.value = await resolveDisplay(newTrack);

    if (isSongSwap && el) {
      await nextTick();
      animateWidthChange(el, startWidth);
    }
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
        v-if="track && display.title"
        ref="badgeRef"
        :key="badgeKey"
        href="https://spotiqueue.com/mwrrowv"
        target="_blank"
        rel="noopener noreferrer"
        class="now-playing-badge"
        :aria-label="`Now playing: ${display.title} by ${fullArtistLabel}`"
      >
        <img
          v-if="display.albumArt"
          :src="display.albumArt"
          class="np-art"
          :alt="display.album ?? 'Album art'"
        />
        <div class="np-text">
          <div class="np-label">
            <span class="np-bars" aria-hidden="true">
              <span></span><span></span><span></span>
            </span>
            Listening to Spotify
          </div>
          <div class="np-track">
            {{ display.title
            }}<template v-if="display.artistLine">
              - {{ display.artistLine }}</template
            >
          </div>
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

    <div class="now-playing-badge measure-clone" aria-hidden="true">
      <img v-if="measureArt" class="np-art" />
      <div class="np-text">
        <div class="np-label">
          <span class="np-bars" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          Listening to Spotify
        </div>
        <div class="np-track" ref="measureTrackRef">
          {{ measureCandidateText }}
        </div>
      </div>
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

.measure-clone {
  position: fixed;
  top: 0;
  left: -99999px;
  visibility: hidden;
  pointer-events: none;
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
