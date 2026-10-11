import { computed, ref, watch } from 'vue';
import { useWindowScroll } from '@vueuse/core';

const FADE_DISTANCE = 120;
const TOP_THRESHOLD = 20;

const dismissed = ref(false);

export function useScrollCue() {
  const { y } = useWindowScroll();
  let atTop = false;

  watch(
    y,
    (value) => {
      if (value < TOP_THRESHOLD) atTop = true;
      else if (atTop && value > FADE_DISTANCE) dismissed.value = true;
    },
    { immediate: true },
  );

  const opacity = computed(() => {
    if (dismissed.value) return 0;
    return Math.max(0, 1 - y.value / FADE_DISTANCE);
  });

  return { opacity };
}
