<template>
    <div class="progress-bar">
        <div class="progress-bar__fill" :style="{ width: `${uploadProgress}%` }"></div>
    </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';

const props = defineProps<{
  uploadProgress: number;
}>();

</script>

<style scoped>
.progress-bar {
  width: 100%;
  height: 1rem;
  background-color: #e0e0e0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background-color: #76c7c0;
  transition: width 0.3s ease-in-out;
}
</style>