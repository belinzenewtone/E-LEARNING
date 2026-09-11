<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const quickNav = [
  { to: '/certifications', icon: 'i-lucide-award',         label: 'Certifications', description: 'Track AWS SAA, Terraform, CKA progress' },
  { to: '/projects',       icon: 'i-lucide-folder-kanban', label: 'Projects',       description: '8-step checklist for each build' },
  { to: '/learning',       icon: 'i-lucide-book-open',     label: 'Learning',       description: 'Python · Bash · Nuxt · Cloud tracks' },
  { to: '/jobs',           icon: 'i-lucide-briefcase',     label: 'Job Pipeline',   description: 'Kanban from applied to offer' },
  { to: '/runway',         icon: 'i-lucide-wallet',        label: 'Runway',         description: 'Financial burn rate & savings' },
  { to: '/checkpoints',   icon: 'i-lucide-flag',           label: 'Checkpoints',    description: 'Month 3, 6, 9, 10 milestone gates' },
  { to: '/log',            icon: 'i-lucide-notebook-pen',  label: 'Daily Log',      description: "Log today's outputs (not hours)" },
  { to: '/case-studies',  icon: 'i-lucide-file-text',      label: 'Case Studies',   description: 'Write up what you learned & built' }
]

// Non-blocking fetches — data populates without freezing the page
const { data: certs, pending: certsPending } = useAsyncData('certs-count', async () => {
  const { count } = await supabase
    .from('certifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
  return count ?? 0
})

const { data: projects, pending: projectsPending } = useAsyncData('projects-count', async () => {
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
})

const { data: applications, pending: appsPending } = useAsyncData('apps-count', async () => {
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
})

const { data: runway, pending: runwayPending } = useAsyncData('runway-latest', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('financial_snapshots')
    .select('months_remaining, monthly_burn')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()
  return data as { months_remaining: number | null; monthly_burn: number | null } | null
})

type RecentLog = { id: string; log_date: string; outputs: string[]; energy_level: number | null }
const { data: recentLogs, pending: logsPending } = useAsyncData('recent-logs', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('daily_logs')
    .select('id, log_date, outputs, energy_level')
    .order('log_date', { ascending: false })
    .limit(5)
  return (data ?? []) as RecentLog[]
})

// Month number (Jan 2026 → Dec 2026)
const startDate = new Date('2026-01-01')
const currentMonth = computed(() => {
  const now = new Date()
  const diff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
  return Math.min(Math.max(diff + 1, 1), 12)
})

const statsLoading = computed(() => certsPending.value || projectsPending.value || appsPending.value || runwayPending.value)

const stats = computed(() => [
  { label: 'Certs Earned',   value: certs.value ?? 0,                       icon: 'i-lucide-award',         color: 'text-yellow-500' },
  { label: 'Projects Built', value: projects.value ?? 0,                    icon: 'i-lucide-folder-kanban', color: 'text-blue-500' },
  { label: 'Applications',   value: applications.value ?? 0,                icon: 'i-lucide-briefcase',     color: 'text-violet-500' },
  { label: 'Months Runway',  value: runway.value?.months_remaining ?? '—',  icon: 'i-lucide-wallet',        color: 'text-emerald-500' }
])
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <p class="text-xs font-mono text-muted-foreground uppercase tracking-widest">Month {{ currentMonth }} of 12</p>
      <h1 class="text-2xl font-bold mt-1">Welcome back, Belinze 👋</h1>
      <p class="text-sm text-muted-foreground mt-1">Cloud Engineering · 12-month sprint</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="statsLoading">
        <div
          v-for="n in 4"
          :key="n"
          class="rounded-xl border border-border bg-card p-5 space-y-3"
        >
          <div class="skeleton h-3 w-24 rounded" />
          <div class="skeleton h-8 w-12 rounded" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl border border-border bg-card p-5 space-y-2"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="stat.icon" :class="['h-4 w-4', stat.color]" />
            <span class="text-xs text-muted-foreground font-medium">{{ stat.label }}</span>
          </div>
          <p class="text-3xl font-bold text-foreground">{{ stat.value }}</p>
        </div>
      </template>
    </div>

    <!-- Quick nav grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="card in quickNav"
        :key="card.to"
        :to="card.to"
        class="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
      >
        <UIcon :name="card.icon" class="h-6 w-6 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
        <p class="font-semibold text-sm text-foreground">{{ card.label }}</p>
        <p class="text-xs text-muted-foreground mt-1">{{ card.description }}</p>
      </NuxtLink>
    </div>

    <!-- Recent logs -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-foreground">Recent Daily Logs</h2>
        <NuxtLink to="/log" class="text-xs text-primary hover:underline">View all →</NuxtLink>
      </div>

      <div class="space-y-2">
        <!-- Skeleton -->
        <template v-if="logsPending">
          <div
            v-for="n in 3"
            :key="n"
            class="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div class="skeleton h-3 w-20 rounded shrink-0" />
            <div class="skeleton h-3 flex-1 rounded" />
            <div class="skeleton h-3 w-8 rounded" />
          </div>
        </template>

        <!-- Data -->
        <template v-else>
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
          >
            <p class="text-xs font-mono text-muted-foreground w-20 shrink-0">{{ log.log_date }}</p>
            <p class="text-sm text-foreground flex-1 truncate">
              {{ (log.outputs as string[])?.join(' · ') || 'No outputs logged' }}
            </p>
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-zap" class="h-3 w-3 text-yellow-500" />
              <span class="text-xs text-muted-foreground">{{ log.energy_level }}/5</span>
            </div>
          </div>
          <div v-if="!recentLogs?.length" class="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            No logs yet. <NuxtLink to="/log" class="text-primary hover:underline">Add today's output →</NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
