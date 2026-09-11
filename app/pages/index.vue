<script setup lang="ts">
definePageMeta({ layout: 'default' })
const user = useSupabaseUser()
onMounted(() => {
  if (user.value) navigateTo('/dashboard')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center space-y-6 max-w-md px-6">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl mx-auto">
        C
      </div>
      <div>
        <h1 class="text-4xl font-bold tracking-tight text-foreground">CloudOS</h1>
        <p class="mt-2 text-muted-foreground text-sm">Your personal command center for the cloud engineering career transition</p>
      </div>
      <UButton to="/login" size="lg" class="w-full">
        Sign in to continue
      </UButton>
    </div>
  </div>
</template>
