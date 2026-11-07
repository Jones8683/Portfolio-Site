(() => {
  const SECRET = 'jjank-arcade-v1';
  const CHECKSUM_LENGTH = 12;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function hash(text) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  function scramble(bytes, key) {
    return bytes.map((byte, index) => {
      const word = hash(`${SECRET}:${key}:${Math.floor(index / 4)}`);
      return byte ^ ((word >>> ((index % 4) * 8)) & 255);
    });
  }

  function sign(key, text) {
    return hash(`${SECRET}:sign:${key}:${text}`)
      .toString(16)
      .padStart(CHECKSUM_LENGTH, '0')
      .slice(-CHECKSUM_LENGTH);
  }

  function toHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function fromHex(hex) {
    return Uint8Array.from(hex.match(/../gu) ?? [], (pair) => Number.parseInt(pair, 16));
  }

  function get(key, fallback) {
    const stored = localStorage.getItem(key) ?? '';
    const checksum = stored.slice(0, CHECKSUM_LENGTH);
    const text = decoder.decode(scramble(fromHex(stored.slice(CHECKSUM_LENGTH)), key));
    return sign(key, text) === checksum ? JSON.parse(text) : fallback;
  }

  function set(key, value) {
    const text = JSON.stringify(value);
    localStorage.setItem(key, sign(key, text) + toHex(scramble(encoder.encode(text), key)));
  }

  window.gameStorage = { get, set };
})();
