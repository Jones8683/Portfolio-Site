<script setup>
defineProps({ controls: { type: Array, required: true } });
</script>

<template>
  <div class="controls-container">
    <div v-for="control in controls" :key="control.action" class="control-item">
      <span>{{ control.action }}</span>
      <div class="key-group">
        <span v-for="key in [control.key].flat()" :key="key" class="key">{{ key }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.controls-container {
  margin-top: 5px;
  padding: 0 5px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--color-subtle);
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;
}

.control-item:last-child {
  border-bottom: none;
}

.key-group {
  display: flex;
  gap: 4px;
}

.key {
  color: #ffffff;
  font-weight: 700;
  background: var(--color-hairline);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  min-width: 18px;
  text-align: center;
  display: inline-block;
}
</style>
