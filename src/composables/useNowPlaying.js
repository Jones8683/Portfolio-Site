import { ref } from "vue";

const track = ref(null);

let pollTimer = null;
let isFetching = false;
let consecutiveFailures = 0;
let activeConsumers = 0;

const POLL_MS = 1000;
const FAILURE_TOLERANCE = 2;

function arraysEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function tracksEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.title === b.title &&
    arraysEqual(a.artists, b.artists) &&
    a.albumArt === b.albumArt &&
    a.songUrl === b.songUrl
  );
}

async function fetchNowPlaying() {
  if (isFetching) return;
  isFetching = true;

  try {
    const res = await fetch("/api/now-playing");
    if (!res.ok) throw new Error(`bad_status_${res.status}`);

    const data = await res.json();
    consecutiveFailures = 0;
    const next = data.isPlaying ? data : null;
    if (!tracksEqual(track.value, next)) {
      track.value = next;
    }
  } catch {
    consecutiveFailures += 1;
    if (consecutiveFailures >= FAILURE_TOLERANCE) {
      track.value = null;
    }
  } finally {
    isFetching = false;
  }
}

function startPolling() {
  activeConsumers += 1;
  fetchNowPlaying();
  if (!pollTimer) {
    pollTimer = setInterval(fetchNowPlaying, POLL_MS);
  }
}

function stopPolling() {
  activeConsumers = Math.max(0, activeConsumers - 1);
  if (activeConsumers === 0 && pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function useNowPlaying() {
  return { track, startPolling, stopPolling };
}
