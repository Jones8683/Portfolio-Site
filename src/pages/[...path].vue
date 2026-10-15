<script setup>
definePage({ meta: { title: 'Page Not Found' } });
</script>

<template>
  <div class="content-wrap">
    <h1 class="not-found-title">404</h1>

    <p class="not-found-subtitle">This is not the page you're looking for</p>

    <RouterLink class="back-link" to="/">
      <svg class="arrow-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10h11m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Take Me Home
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
  color: #94a3b8;
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
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  transform: scaleX(-1);
}
</style>
