<script setup>
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { useNowPlaying } from '@/composables/useNowPlaying';

const MORPH_MS = 560;
const MORPH_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FADE_OUT_MS = 140;
const FADE_IN_MS = 260;
const LIVE_RADIUS = 18;
const PRELOAD_TIMEOUT_MS = 1500;
const TINT_SAMPLE_SIZE = 16;
const TINT_LIGHTNESS = 70;
const SPIN_STOP_MS = 600;

const { track, isStale } = useNowPlaying();

const pill = useTemplateRef('pill');
const live = useTemplateRef('live');
const cover = useTemplateRef('cover');
const shown = shallowRef(null);
const tint = ref(null);
const isSwapped = ref(false);
const hasCoverError = ref(false);
const isStopped = ref(true);

let changeToken = 0;
let stopFrame;

const isFrozen = computed(() => isStale.value || !shown.value?.playing);

const progressStyle = computed(() => ({
  '--duration': `${shown.value.durationMs}ms`,
  '--delay': `${shown.value.startedAt - Date.now()}ms`,
}));

const label = computed(
  () =>
    `${shown.value.playing ? 'Listening to' : 'Paused on'} ${shown.value.title} by ${shown.value.artist} on Spotify`,
);

function readTint(image) {
  const canvas = document.createElement('canvas');
  canvas.width = TINT_SAMPLE_SIZE;
  canvas.height = TINT_SAMPLE_SIZE;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, TINT_SAMPLE_SIZE, TINT_SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, TINT_SAMPLE_SIZE, TINT_SAMPLE_SIZE);

  let red = 0;
  let green = 0;
  let blue = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = data.subarray(i, i + 3);
    const weight = Math.max(r, g, b) - Math.min(r, g, b) + 1;

    red += r * weight;
    green += g * weight;
    blue += b * weight;
    total += weight;
  }

  const r = red / total / 255;
  const g = green / total / 255;
  const b = blue / total / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return `hsl(0 0% ${TINT_LIGHTNESS}%)`;

  const saturation = delta / (1 - Math.abs(max + min - 1));
  const sector =
    max === r ? (g - b) / delta + 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  const hue = (sector % 6) * 60;

  return `hsl(${Math.round(hue)} ${Math.round(saturation * 100)}% ${TINT_LIGHTNESS}%)`;
}

function preload(url) {
  if (!url) return Promise.resolve(null);

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = url;

  return Promise.race([
    image
      .decode()
      .then(() => readTint(image))
      .catch(() => null),
    new Promise((resolve) => {
      setTimeout(resolve, PRELOAD_TIMEOUT_MS, null);
    }),
  ]);
}

function show(next, nextTint) {
  shown.value = next;
  tint.value = nextTint;
}

async function morph(update) {
  isSwapped.value = true;

  const element = pill.value;

  if (!element) {
    update();
    return;
  }

  live.value?.style.removeProperty('width');

  const from = element.getBoundingClientRect();
  const fromRadius = shown.value === null ? from.height / 2 : LIVE_RADIUS;

  update();
  await nextTick();

  const to = element.getBoundingClientRect();
  const toRadius = shown.value === null ? to.height / 2 : LIVE_RADIUS;

  const content = live.value;
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
}

async function switchTrack(next) {
  const token = changeToken;
  const ready = preload(next.art);
  const content = live.value;

  if (!content) {
    const nextTint = await ready;
    if (token === changeToken) show(next, nextTint);
    return;
  }

  const fadeOut = content.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: FADE_OUT_MS,
    easing: 'ease-in',
    fill: 'forwards',
  });

  const [, nextTint] = await Promise.all([fadeOut.finished.catch(() => {}), ready]);

  if (token !== changeToken) {
    fadeOut.cancel();
    return;
  }

  await morph(() => show(next, nextTint));

  for (const animation of live.value?.getAnimations() ?? []) animation.cancel();
  live.value?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: FADE_IN_MS,
    easing: 'ease-out',
  });
}

async function appear(next) {
  const token = changeToken;
  const nextTint = await preload(next.art);

  if (token === changeToken) await morph(() => show(next, nextTint));
}

watch(
  track,
  (next) => {
    changeToken++;
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
    hasCoverError.value = false;
  },
);

watch(
  isFrozen,
  (frozen) => {
    cancelAnimationFrame(stopFrame);

    const spin = cover.value?.getAnimations()[0];
    if (spin) spin.playbackRate = 1;

    if (!frozen || !spin) {
      isStopped.value = frozen;
      return;
    }

    let start;
    function slow(now) {
      start ??= now;
      const progress = Math.min((now - start) / SPIN_STOP_MS, 1);
      spin.playbackRate = 1 - progress;

      if (progress < 1) {
        stopFrame = requestAnimationFrame(slow);
      } else {
        isStopped.value = true;
        spin.playbackRate = 1;
      }
    }

    stopFrame = requestAnimationFrame(slow);
  },
  { immediate: true },
);
</script>

<template>
  <div class="slot">
    <div
      ref="pill"
      class="status-pill"
      :class="{ 'is-live': shown, 'is-paused': shown && !shown.playing, swapped: isSwapped }"
      :style="{ '--live-radius': `${LIVE_RADIUS}px`, '--tint': tint }"
    >
      <a
        v-if="shown"
        ref="live"
        class="live"
        :href="shown.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="label"
      >
        <span v-if="shown.art && !hasCoverError" class="art" :class="{ paused: isStopped }">
          <img
            ref="cover"
            class="cover"
            :src="shown.art"
            alt=""
            width="40"
            height="40"
            crossorigin="anonymous"
            decoding="sync"
            @error="hasCoverError = true"
          />
          <span class="pause" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="22" height="22">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          </span>
        </span>
        <span class="text">
          <span class="title">{{ shown.title }}</span>
          <span class="artist">{{ shown.artist }}</span>
          <span
            :key="shown.id"
            class="progress"
            :class="{ paused: isFrozen }"
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
  max-width: min(calc(100vw - 40px), 384px);
  padding: 6px 14px;
  border-radius: 100px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #64a8ff;
  background: rgba(58, 123, 213, 0.28);
  border: 1px solid rgba(58, 123, 213, 0.438);
  user-select: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.status-pill.is-live {
  min-width: min(192px, calc(100vw - 40px));
  padding: 0;
  border-radius: var(--live-radius);
  background: color-mix(in srgb, var(--tint) 28%, transparent);
  border-color: color-mix(in srgb, var(--tint) 44%, transparent);
}

@media (hover: hover) {
  .status-pill.is-live:hover {
    background: color-mix(in srgb, var(--tint) 36%, transparent);
    border-color: color-mix(in srgb, var(--tint) 60%, transparent);
  }
}

.status-pill:has(.live:focus-visible) {
  outline: 2px solid var(--tint);
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

.live:not(:has(.art)) {
  padding-left: 18px;
}

.live:focus-visible {
  outline: none;
}

.art {
  position: relative;
  width: 40px;
  height: 40px;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: record-spin 8s linear infinite;
}

.paused .cover {
  animation-play-state: paused;
}

.pause {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #f4f7fb;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pause svg {
  fill: currentColor;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.is-paused .pause {
  opacity: 1;
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
  color: #cbd5e1;
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
  background: var(--tint);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
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

@keyframes record-spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes swap-in {
  from {
    opacity: 0;
  }
}

@media (width <= 720px) {
  .slot {
    --slot-overlap: -8px;
  }
}
</style>
