function hash(str) {
  let a = 0x9e3779b9,
    b = 0x85ebca6b;
  for (let i = 0; i < str.length; i++) {
    a ^= str.charCodeAt(i) * 0xcc9e2d51;
    a = (a << 13) | (a >>> 19);
    b ^= str.charCodeAt(i) * 0x1b873593;
    b = (b << 15) | (b >>> 17);
  }
  const h = ((a ^ b) >>> 0).toString(36);
  return h.padStart(8, "0").slice(-8);
}

export function createScoreSerializer(key) {
  return {
    read: (v) => {
      if (!v || v.length < 9) return 0;
      const h = v.slice(0, 8);
      const n = parseInt(v.slice(8), 36);
      if (isNaN(n) || h !== hash(key + n)) return 0;
      return n;
    },
    write: (v) => {
      const n = Math.max(0, Math.floor(v)) || 0;
      return hash(key + n) + n.toString(36);
    },
  };
}
