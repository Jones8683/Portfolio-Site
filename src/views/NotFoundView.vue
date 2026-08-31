<template>
  <div class="content-wrap">
    <h1 class="name-title not-found-title">404</h1>

    <p class="location-text not-found-subtitle">This is not the page you're looking for</p>

    <RouterLink to="/" class="repo-link not-found-link">
      <svg class="nav-arrow-icon arrow-flip" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
  margin-top: 96px;
  margin-bottom: 38px;
  font-size: 120px;
}

.not-found-subtitle {
  color: #94a3b8;
  font-size: 1.05rem;
  margin-bottom: 10px;
  font-weight: 400;
}

.not-found-link {
  margin-top: 20px;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
