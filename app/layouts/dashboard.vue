<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const primaryNav = [
  { label: 'Dashboard',    icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
  { label: 'Learning',     icon: 'i-lucide-book-open',        to: '/learning' },
  { label: 'Daily Log',    icon: 'i-lucide-notebook-pen',     to: '/log' },
  { label: 'Checkpoints',  icon: 'i-lucide-flag',             to: '/checkpoints' },
  { label: 'Projects',     icon: 'i-lucide-folder-kanban',    to: '/projects' },
  { label: 'Case Studies', icon: 'i-lucide-file-text',        to: '/case-studies' }
]

const secondaryNav = [
  { label: 'Certifications', icon: 'i-lucide-award',      to: '/certifications' },
  { label: 'Jobs Pipeline',  icon: 'i-lucide-briefcase',  to: '/jobs' },
  { label: 'Runway',         icon: 'i-lucide-wallet',     to: '/runway' }
]

const allNav = [...primaryNav, ...secondaryNav]
const moreOpen = ref(false)
const sidebarOpen = ref(true)

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}

const currentLabel = computed(
  () => allNav.find(n => route.path.startsWith(n.to))?.label ?? 'CloudOS'
)
</script>

<template>
  <div class="flex h-screen bg-background text-foreground overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col border-r border-border transition-all duration-200 shrink-0',
        sidebarOpen ? 'w-56' : 'w-14'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 h-14 px-4 border-b border-border">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          C
        </div>
        <span v-if="sidebarOpen" class="font-bold text-sm tracking-tight">CloudOS</span>
        <UButton
          class="ml-auto"
          variant="ghost"
          size="xs"
          :icon="sidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
          @click="sidebarOpen = !sidebarOpen"
        />
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <!-- Primary items -->
        <NuxtLink
          v-for="item in primaryNav"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
            route.path.startsWith(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
        >
          <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
          <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
        </NuxtLink>

        <!-- More toggle -->
        <button
          :class="[
            'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium w-full transition-colors',
            'text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
          @click="moreOpen = !moreOpen"
        >
          <UIcon :name="moreOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="h-4 w-4 shrink-0" />
          <span v-if="sidebarOpen" class="truncate">More</span>
        </button>

        <!-- Secondary items (collapsible) -->
        <Transition name="slide">
          <div v-if="moreOpen" class="space-y-0.5">
            <NuxtLink
              v-for="item in secondaryNav"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                sidebarOpen ? 'pl-6' : '',
                route.path.startsWith(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              ]"
            >
              <UIcon :name="item.icon" class="h-4 w-4 shrink-0" />
              <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </Transition>
      </nav>

      <!-- Footer -->
      <div class="border-t border-border p-2">
        <UButton
          variant="ghost"
          size="sm"
          :class="['w-full', sidebarOpen ? 'justify-start gap-3' : 'justify-center']"
          icon="i-lucide-log-out"
          @click="signOut"
        >
          <span v-if="sidebarOpen">Sign out</span>
        </UButton>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top bar -->
      <header class="h-14 border-b border-border flex items-center px-6 gap-4 shrink-0">
        <h1 class="text-sm font-semibold text-foreground">{{ currentLabel }}</h1>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-xs text-muted-foreground">{{ user?.email }}</span>
          <div class="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            B
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
