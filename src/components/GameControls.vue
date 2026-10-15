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
  margin-bottom: 6px;
  padding-bottom: 4px;
  font-size: 11px;
  color: #7c8ba1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.control-item:last-child {
  border-bottom: none;
}

.key-group {
  display: flex;
  gap: 4px;
}

.key {
  display: inline-block;
  min-width: 18px;
  padding: 2px 6px;
  color: #ffffff;
  font-weight: 700;
  font-size: 10px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
