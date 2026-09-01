<template>
  <div class="mobile-msg">
    <div class="content-wrap">
      <h1 class="mobile-heading">Not supported on mobile</h1>
      <RouterLink to="/play" class="mobile-back-link">
        <svg class="nav-arrow-icon arrow-flip" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 10h11m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Back to arcade
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.mobile-heading {
  font-size: 32px;
  margin-bottom: 16px;
  margin-top: 60px;
  width: 100%;
  color: white;
}

.mobile-back-link {
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: lightskyblue;
  text-decoration: none;
  white-space: nowrap;
  font-family: var(--font-ui, 'Satoshi', 'Segoe UI', sans-serif);
  font-weight: 600;
}

.nav-arrow-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
}

.arrow-flip {
  transform: scaleX(-1);
}
</style>
