<script setup lang="ts">
definePageMeta({ layout: 'default' })

const ALLOWED_EMAIL = 'belinze.newtone@jtl.co.ke'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// If already signed in with the right account, go straight to dashboard.
// Check email here so we don't create a middleware redirect loop.
watchEffect(async () => {
  if (!user.value) return
  if (user.value.email === ALLOWED_EMAIL) {
    await navigateTo('/dashboard')
  } else {
    // Signed in with wrong account — sign out and show error
    await supabase.auth.signOut()
    error.value = 'Access denied: this app is private.'
    loading.value = false
  }
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return
    }
    if (!data.session) {
      error.value = 'No session returned — check your email for a confirmation link.'
      loading.value = false
      return
    }
    // Success — keep spinner; watchEffect navigates once user.value is set.
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Unexpected error — check your connection.'
    loading.value = false
  }
}

const sideFeatures = [
  { icon: 'i-lucide-award',          label: 'Certifications',   detail: 'AWS SAA → Terraform → CKA' },
  { icon: 'i-lucide-folder-kanban',  label: 'Projects',         detail: '8-step checklist per project' },
  { icon: 'i-lucide-briefcase',      label: 'Job Pipeline',     detail: 'Full Kanban board' },
  { icon: 'i-lucide-wallet',         label: 'Financial Runway', detail: 'Monthly burn & savings' },
  { icon: 'i-lucide-book-open',      label: 'Learning Tracks',  detail: 'Python · Bash · Nuxt · Cloud' },
  { icon: 'i-lucide-flag',           label: 'Checkpoints',      detail: 'Month 3, 6, 9, 10 gates' }
]
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-[50%] flex-col justify-between p-10 bg-muted/40 border-r border-border">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          C
        </div>
        <span class="font-bold tracking-tight">CloudOS</span>
      </div>

      <div class="space-y-8">
        <div>
          <h1 class="text-4xl font-bold leading-tight text-foreground">
            12 months.<br>
            <span class="text-primary">One mission.</span>
          </h1>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div v-for="item in sideFeatures" :key="item.label" class="rounded-xl border border-border bg-background/60 p-4">
            <UIcon :name="item.icon" class="h-5 w-5 text-primary mb-2" />
            <p class="text-xs font-semibold text-foreground">{{ item.label }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">{{ item.detail }}</p>
          </div>
        </div>
      </div>

      <p class="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
        Nuxt 4.5 · Supabase · Nuxt UI · Vercel
      </p>
    </div>

    <!-- Right panel: login form -->
    <div class="flex flex-1 items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-6">
        <div class="lg:hidden flex items-center gap-3 mb-4">
          <div class="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">C</div>
          <span class="font-bold">CloudOS</span>
        </div>

        <div>
          <p class="text-xs font-mono text-muted-foreground uppercase tracking-widest">Sign in</p>
          <h2 class="text-2xl font-bold mt-1">Welcome back</h2>
        </div>

        <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :description="error" />

        <form class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="belinze@example.com"
              autocomplete="email"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            :loading="loading"
            class="mx-auto block"
            size="md"
          >
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
