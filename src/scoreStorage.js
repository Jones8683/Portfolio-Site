import { useStorage } from '@vueuse/core';

function hash(str) {
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function useHighScore(key) {
  const sign = (n) => `${n}.${hash(key + n)}`;
  return useStorage(key, 0, localStorage, {
    serializer: {
      read: (v) => {
        const n = parseInt(v, 10);
        return n >= 0 && v === sign(n) ? n : 0;
      },
      write: (v) => sign(Math.max(0, Math.floor(v)) || 0),
    },
  });
}
