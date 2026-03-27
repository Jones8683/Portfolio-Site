<template>
  <footer class="main-footer">
    <div class="footer-line"></div>
    <p>&copy; {{ new Date().getFullYear() }} Jones Jankovic</p>
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

.footer-line {
  width: 90%;
  max-width: 1200px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.main-footer p {
  color: #64748b;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
</style>
