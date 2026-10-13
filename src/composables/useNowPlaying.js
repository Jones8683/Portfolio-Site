import { onMounted, onScopeDispose, ref, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';

const ENDPOINT = 'https://jjank.com/api/now-playing';
const POLL_MS = 5000;
const MIN_POLL_MS = 1000;
const TRACK_END_MARGIN_MS = 300;
const IDLE_GRACE_MS = 6000;
const SEEK_TOLERANCE_MS = 1500;
const REQUEST_TIMEOUT_MS = 8000;

export function useNowPlaying() {
  const track = ref(null);
  const stale = ref(false);
  const visibility = useDocumentVisibility();

  let pollTimer;
  let graceTimer;
  let trackId = 0;
  let warned = false;
  let disposed = false;

  const showTrack = (data) => {
    clearTimeout(graceTimer);
    graceTimer = undefined;

    const startedAt = Date.now() - data.progressMs;
    const current = track.value;
    const unchanged =
      current !== null &&
      !stale.value &&
      current.url === data.url &&
      Math.abs(current.startedAt - startedAt) <= SEEK_TOLERANCE_MS;

    stale.value = false;

    if (unchanged) return;

    trackId += 1;
    track.value = {
      id: trackId,
      title: data.track,
      artist: data.artist,
      art: data.art,
      url: data.url,
      durationMs: data.durationMs,
      startedAt,
    };
  };

  const hideTrack = () => {
    if (track.value === null || graceTimer !== undefined) return;

    stale.value = true;
    graceTimer = setTimeout(() => {
      graceTimer = undefined;
      stale.value = false;
      track.value = null;
    }, IDLE_GRACE_MS);
  };

  const nextDelay = () => {
    if (track.value === null || stale.value) return POLL_MS;

    const remaining = track.value.durationMs - (Date.now() - track.value.startedAt);
    return Math.min(POLL_MS, Math.max(MIN_POLL_MS, remaining + TRACK_END_MARGIN_MS));
  };

  const schedule = () => {
    clearTimeout(pollTimer);
    if (disposed || visibility.value === 'hidden') return;
    pollTimer = setTimeout(poll, nextDelay());
  };

  async function poll() {
    try {
      const response = await fetch(ENDPOINT, {
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const data = await response.json();

      if (data.needsReauth && !warned) {
        warned = true;
        console.warn('Spotify needs to be linked again.');
      }

      if (response.ok && data.isPlaying) showTrack(data);
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
    disposed = true;
    clearTimeout(pollTimer);
    clearTimeout(graceTimer);
  });

  return { track, stale };
}
