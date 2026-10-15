<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
const auth = useAuthStore()
const user = useUserStore()
onMounted(() => {
  auth.init()
  if (!user.loaded) user.fetchMe()
})
</script>
