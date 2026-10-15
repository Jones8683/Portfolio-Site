import { onMounted, onScopeDispose, ref, shallowRef, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';

const ENDPOINT = 'https://jjank.com/api/now-playing';
const POLL_MS = 5000;
const MIN_POLL_MS = 1000;
const TRACK_END_MARGIN_MS = 300;
const IDLE_GRACE_MS = 6000;
const SEEK_TOLERANCE_MS = 1500;
const REQUEST_TIMEOUT_MS = 8000;

function position(track) {
  return track.playing ? Date.now() - track.startedAt : track.progressMs;
}

export function useNowPlaying() {
  const track = shallowRef(null);
  const isStale = ref(false);
  const visibility = useDocumentVisibility();

  let pollTimer;
  let graceTimer;
  let trackId = 0;
  let hasWarned = false;
  let isDisposed = false;

  function showTrack(data) {
    clearTimeout(graceTimer);
    graceTimer = undefined;

    const startedAt = Date.now() - data.progressMs;
    const current = track.value;
    const unchanged =
      current !== null &&
      !isStale.value &&
      current.url === data.url &&
      current.playing === data.isPlaying &&
      Math.abs(position(current) - data.progressMs) <= SEEK_TOLERANCE_MS;

    isStale.value = false;

    if (unchanged) return;

    trackId++;
    track.value = {
      id: trackId,
      title: data.track,
      artist: data.artist,
      art: data.art,
      url: data.url,
      durationMs: data.durationMs,
      progressMs: data.progressMs,
      startedAt,
      playing: data.isPlaying,
    };
  }

  function hideTrack() {
    if (track.value === null || graceTimer !== undefined) return;

    isStale.value = true;
    graceTimer = setTimeout(() => {
      graceTimer = undefined;
      isStale.value = false;
      track.value = null;
    }, IDLE_GRACE_MS);
  }

  function nextDelay() {
    if (track.value === null || isStale.value || !track.value.playing) return POLL_MS;

    const remaining = track.value.durationMs - (Date.now() - track.value.startedAt);
    return Math.min(POLL_MS, Math.max(MIN_POLL_MS, remaining + TRACK_END_MARGIN_MS));
  }

  function schedule() {
    clearTimeout(pollTimer);
    if (isDisposed || visibility.value === 'hidden') return;
    pollTimer = setTimeout(poll, nextDelay());
  }

  async function poll() {
    try {
      const response = await fetch(ENDPOINT, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const data = await response.json();

      if (data.needsReauth && !hasWarned) {
        hasWarned = true;
        console.warn('Spotify needs to be linked again.');
      }

      if (response.ok && data.track) showTrack(data);
      else hideTrack();
    } catch {
      hideTrack();
    }

    schedule();
  }

  watch(visibility, (state) => {
    clearTimeout(pollTimer);
    if (state === 'visible') poll();
  });

  onMounted(() => {
    if (visibility.value !== 'hidden') poll();
  });

  onScopeDispose(() => {
    isDisposed = true;
    clearTimeout(pollTimer);
    clearTimeout(graceTimer);
  });

  return { track, isStale };
}
