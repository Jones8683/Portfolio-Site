<script setup>
const repo = 'https://github.com/Jones8683/Portfolio-Site';
const hash = import.meta.env.VITE_BUILD_HASH;
const builtAt = new Date(import.meta.env.VITE_BUILD_DATE);

const date = builtAt.toLocaleDateString('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const time = builtAt.toLocaleTimeString('en-AU', {
  hour: 'numeric',
  minute: '2-digit',
});
</script>

<template>
  <footer class="main-footer">
    <div class="footer-line"></div>
    <div class="footer-meta">
      <p>&copy; {{ new Date().getFullYear() }} Jones Jankovic</p>
      <span class="footer-divider" aria-hidden="true">|</span>
      <a
        :href="`${repo}/commit/${hash}`"
        target="_blank"
        rel="noopener noreferrer"
        class="source-link"
      >
        Build {{ hash }} • {{ date }} {{ time }}
      </a>
    </div>
  </footer>
</template>

<style scoped>
.main-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  margin-top: 40px;
  user-select: none;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #7c8ba1;
  font-family: var(--font-ui);
  font-size: 14px;
  letter-spacing: 0.5px;
}

.footer-line {
  width: 90%;
  max-width: 1200px;
  height: 1px;
  background: var(--color-hairline);
  margin-bottom: 20px;
}

.source-link {
  transition: color 0.2s ease;
}

.source-link:hover,
.source-link:focus-visible {
  color: var(--color-muted);
}

@media (width <= 480px) {
  .footer-meta {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }

  .footer-divider {
    display: none;
  }
}
</style>
