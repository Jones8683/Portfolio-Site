<template>
  <div class="controls-container">
    <div v-for="(control, index) in controls" :key="index" class="control-item">
      <span>{{ control.action }}</span>
      <div v-if="Array.isArray(control.key)" class="key-group">
        <span v-for="(k, i) in control.key" :key="i" class="key">{{ k }}</span>
      </div>
      <span v-else class="key">{{ control.key }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  controls: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(
        (control) =>
          control.action && (control.key || Array.isArray(control.key)),
      );
    },
  },
});
</script>

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
  color: #64748b;
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
  color: #fff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  min-width: 18px;
  text-align: center;
  display: inline-block;
}
</style>
