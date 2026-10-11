<template>
  <footer class="main-footer">
    <div class="footer-line"></div>
    <div class="footer-meta">
      <p>&copy; {{ new Date().getFullYear() }} Jones Jankovic</p>
      <span class="footer-divider" aria-hidden="true">|</span>
      <a
        href="https://github.com/Jones8683/Portfolio-Site"
        target="_blank"
        rel="noopener noreferrer"
        class="source-link"
      >
        View source
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
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-line {
  width: 90%;
  max-width: 1200px;
  height: 1px;
  background: var(--color-hairline);
  margin-bottom: 20px;
}

.main-footer p {
  color: var(--color-subtle);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.footer-divider {
  color: var(--color-subtle);
  font-family: var(--font-ui);
  font-size: 0.85rem;
}

.source-link {
  color: var(--color-subtle);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
}

.source-link:hover,
.source-link:focus-visible {
  color: var(--color-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
