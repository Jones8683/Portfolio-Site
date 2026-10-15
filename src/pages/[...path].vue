<script setup>
definePage({ meta: { title: 'Page not found' } });
</script>

<template>
  <div class="content-wrap">
    <h1 class="not-found-title">404</h1>

    <p class="not-found-subtitle">This is not the page you're looking for</p>

    <RouterLink to="/" class="back-link">
      <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10h11m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Take me home
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found-title {
  margin-bottom: 4px;
  font-size: 120px;
  line-height: 1;
  text-wrap: balance;
}

.not-found-subtitle {
  margin-top: -8px;
  margin-bottom: 10px;
  color: var(--color-muted);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  color: #87cefa;
}

.back-link:hover {
  text-decoration: underline;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transform: scaleX(-1);
}
</style>
