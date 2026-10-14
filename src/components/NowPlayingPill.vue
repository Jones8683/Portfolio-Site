<script setup>
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { usePreferredReducedMotion } from '@vueuse/core';
import { useNowPlaying } from '@/composables/useNowPlaying';

const MORPH_MS = 560;
const MORPH_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FADE_OUT_MS = 140;
const FADE_IN_MS = 260;
const LIVE_RADIUS = 18;
const PRELOAD_TIMEOUT_MS = 1500;

const { track, stale } = useNowPlaying();
const reducedMotion = usePreferredReducedMotion();

const pill = ref(null);
const shown = shallowRef(null);
const swapped = ref(false);
const coverFailed = ref(false);

let changeToken = 0;

const preload = (url) => {
  if (!url) return Promise.resolve();

  const image = new Image();
  image.src = url;

  return Promise.race([
    image.decode().catch(() => {}),
    new Promise((resolve) => {
      setTimeout(resolve, PRELOAD_TIMEOUT_MS);
    }),
  ]);
};

const progressStyle = computed(() => ({
  '--duration': `${shown.value.durationMs}ms`,
  '--delay': `${shown.value.startedAt - Date.now()}ms`,
}));

const label = computed(
  () => `Listening to ${shown.value.title} by ${shown.value.artist} on Spotify`,
);

const morph = async (update) => {
  swapped.value = true;

  const element = pill.value;

  if (!element || reducedMotion.value === 'reduce') {
    update();
    return;
  }

  element.querySelector('.live')?.style.removeProperty('width');

  const from = element.getBoundingClientRect();
  const fromRadius = shown.value === null ? from.height / 2 : LIVE_RADIUS;

  update();
  await nextTick();

  const to = element.getBoundingClientRect();
  const toRadius = shown.value === null ? to.height / 2 : LIVE_RADIUS;

  const content = element.querySelector('.live');
  if (content) content.style.width = `${content.getBoundingClientRect().width}px`;

  const animation = element.animate(
    [
      {
        width: `${from.width}px`,
        minWidth: `${from.width}px`,
        height: `${from.height}px`,
        borderRadius: `${fromRadius}px`,
      },
      {
        width: `${to.width}px`,
        minWidth: `${to.width}px`,
        height: `${to.height}px`,
        borderRadius: `${toRadius}px`,
      },
    ],
    { duration: MORPH_MS, easing: MORPH_EASING },
  );

  animation.addEventListener('finish', () => content?.style.removeProperty('width'), {
    once: true,
  });
};

const switchTrack = async (next) => {
  const token = changeToken;
  const ready = preload(next.art);
  const content = pill.value?.querySelector('.live');

  if (!content || reducedMotion.value === 'reduce') {
    await ready;
    if (token === changeToken) shown.value = next;
    return;
  }

  const fadeOut = content.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: FADE_OUT_MS,
    easing: 'ease-in',
    fill: 'forwards',
  });

  await Promise.all([fadeOut.finished.catch(() => {}), ready]);

  if (token !== changeToken) {
    fadeOut.cancel();
    return;
  }

  await morph(() => {
    shown.value = next;
  });

  const incoming = pill.value?.querySelector('.live');
  incoming?.getAnimations().forEach((animation) => animation.cancel());
  incoming?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: FADE_IN_MS,
    easing: 'ease-out',
  });
};

const appear = async (next) => {
  const token = changeToken;
  await preload(next.art);

  if (token === changeToken) {
    await morph(() => {
      shown.value = next;
    });
  }
};

watch(
  track,
  (next) => {
    changeToken += 1;
    const current = shown.value;

    if (next === null) {
      if (current !== null) {
        morph(() => {
          shown.value = null;
        });
      }
    } else if (current === null) {
      appear(next);
    } else if (current.url === next.url) {
      shown.value = next;
    } else {
      switchTrack(next);
    }
  },
  { flush: 'sync' },
);

watch(
  () => shown.value?.art,
  () => {
    coverFailed.value = false;
  },
);
</script>

<template>
  <div class="slot">
    <div
      ref="pill"
      class="status-pill"
      :class="{ 'is-live': shown, swapped }"
      :style="{ '--live-radius': `${LIVE_RADIUS}px` }"
    >
      <a
        v-if="shown"
        class="live"
        :href="shown.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="label"
      >
        <img
          v-if="shown.art && !coverFailed"
          class="cover"
          :src="shown.art"
          alt=""
          width="40"
          height="40"
          decoding="sync"
          @error="coverFailed = true"
        />
        <span class="text">
          <span class="title">{{ shown.title }}</span>
          <span class="artist">{{ shown.artist }}</span>
          <span
            :key="shown.id"
            class="progress"
            :class="{ paused: stale }"
            :style="progressStyle"
            aria-hidden="true"
          >
            <span class="bar"><span class="fill"></span></span>
            <span class="thumb"></span>
          </span>
        </span>
      </a>
      <span v-else class="idle">Student | Australia</span>
    </div>
  </div>
</template>

<style scoped>
.slot {
  --slot-height: 58px;
  --slot-overlap: 10px;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: var(--slot-height);
  margin-bottom: calc(var(--slot-overlap) * -1);
  pointer-events: none;
}

.status-pill {
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  max-width: min(calc(100vw - 40px), 24rem);
  padding: 6px 14px;
  border-radius: 100px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #64a8ff;
  background: rgba(58, 123, 213, 0.14);
  border: 1px solid rgba(58, 123, 213, 0.438);
  user-select: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.status-pill.is-live {
  min-width: min(12rem, calc(100vw - 40px));
  padding: 0;
  border-radius: var(--live-radius);
}

.status-pill.is-live:hover {
  background: rgba(58, 123, 213, 0.22);
  border-color: rgba(58, 123, 213, 0.6);
}

.status-pill:has(.live:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.idle {
  display: block;
  white-space: nowrap;
}

.live {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px 18px 8px 8px;
  color: inherit;
}

.live:not(:has(.cover)) {
  padding-left: 18px;
}

.live:focus-visible {
  outline: none;
}

.cover {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 10px;
  object-fit: cover;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.title,
.artist {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  font-size: 13px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: var(--color-text-soft);
}

.artist {
  line-height: 15px;
  color: var(--color-muted);
}

.progress {
  --thumb: 7px;
  position: relative;
  margin-top: 6px;
}

.bar {
  display: block;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.fill,
.thumb {
  transform: translateX(-100%);
  animation: track-progress var(--duration) linear var(--delay) both;
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: currentColor;
}

.thumb {
  position: absolute;
  inset: 0;
}

.thumb::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: var(--thumb);
  height: var(--thumb);
  border-radius: 50%;
  background: #f4f7fb;
  transform: translate(50%, -50%);
}

.paused .fill,
.paused .thumb {
  animation-play-state: paused;
}

.swapped .idle,
.swapped .live {
  animation: swap-in 0.3s ease-out 0.14s both;
}

@keyframes track-progress {
  to {
    transform: translateX(0);
  }
}

@keyframes swap-in {
  from {
    opacity: 0;
  }
}

@media (max-width: 720px) {
  .slot {
    --slot-overlap: -8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-pill {
    transition: none;
  }

  .swapped .idle,
  .swapped .live {
    animation: none;
  }
}
</style>
