<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div style="text-align: center; padding: 2rem; font-family: sans-serif; color: white; background: #121212; min-height: 100vh;">
    <h1>⚡ Welcome to VibeCode Vue!</h1>
    <button @click="count++" style="padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; background: #42b883; color: white; border: none;">
      Count is: {{ count }}
    </button>
  </div>
</template>
