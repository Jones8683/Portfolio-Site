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
  letter-spacing: -1px;
  margin-top: 60px;
  width: 100%;
  color: white;
}

.mobile-back-link {
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: lightskyblue;
  text-decoration: none;
}
</style>
