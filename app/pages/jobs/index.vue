<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()

const COLUMNS = [
  { key: 'saved',       label: 'Saved',          color: 'border-slate-400/40',   bg: 'bg-slate-400/5' },
  { key: 'applied',     label: 'Applied',         color: 'border-blue-400/40',    bg: 'bg-blue-400/5' },
  { key: 'screening',   label: 'Screening',       color: 'border-yellow-400/40',  bg: 'bg-yellow-400/5' },
  { key: 'interview',   label: 'Interviewing',    color: 'border-violet-400/40',  bg: 'bg-violet-400/5' },
  { key: 'offer',       label: 'Offer',           color: 'border-emerald-400/40', bg: 'bg-emerald-400/5' },
  { key: 'rejected',    label: 'Rejected',        color: 'border-red-400/40',     bg: 'bg-red-400/5' }
]

type Application = { id: string; company: string; role: string; stage: string; job_url: string | null; applied_date: string | null; salary_range: string | null; notes: string | null }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any

const { data: applications, pending: appsPending, refresh } = useAsyncData('applications', async () => {
  const { data } = await sb
    .from('applications')
    .select('*')
    .order('applied_date', { ascending: false })
  return (data ?? []) as Application[]
})

const byStage = computed(() => {
  const map: Record<string, Application[]> = {}
  COLUMNS.forEach(c => { map[c.key] = [] })
  for (const app of (applications.value ?? [])) {
    if (map[app.stage]) map[app.stage]!.push(app)
    else map['saved']!.push(app)
  }
  return map
})

const showModal = ref(false)
const form = reactive({
  company: '', role: '', job_url: '', applied_date: '', salary_range: '', notes: '', stage: 'saved'
})

async function addApplication() {
  await sb.from('applications').insert({ ...form })
  await refresh()
  showModal.value = false
  Object.assign(form, { company: '', role: '', job_url: '', applied_date: '', salary_range: '', notes: '', stage: 'saved' })
}

async function moveStage(id: string, stage: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('applications').update({ stage }).eq('id', id)
  await refresh()
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Job Pipeline</h1>
        <p class="text-sm text-muted-foreground mt-1">Kanban board — from saved to offer</p>
      </div>
      <UButton icon="i-lucide-plus" @click="showModal = true">Add Application</UButton>
    </div>

    <!-- Skeleton -->
    <template v-if="appsPending">
      <div class="flex gap-4 overflow-x-auto pb-4">
        <div v-for="n in 4" :key="n" class="rounded-xl border border-border/40 bg-muted/10 p-3 min-w-[220px] w-[220px] shrink-0 space-y-2">
          <div class="skeleton h-3 w-20 rounded" />
          <div v-for="i in 2" :key="i" class="rounded-lg border border-border bg-card p-3 space-y-2">
            <div class="skeleton h-3 w-32 rounded" />
            <div class="skeleton h-2 w-24 rounded" />
          </div>
        </div>
      </div>
    </template>

    <!-- Kanban board -->
    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="col in COLUMNS"
        :key="col.key"
        :class="['rounded-xl border p-3 min-w-[220px] w-[220px] shrink-0 space-y-2', col.color, col.bg]"
      >
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ col.label }}</p>
          <span class="text-xs text-muted-foreground">{{ byStage[col.key]?.length ?? 0 }}</span>
        </div>

        <div
          v-for="app in (byStage[col.key] as Array<Record<string, unknown>>)"
          :key="app.id as string"
          class="rounded-lg border border-border bg-card p-3 space-y-2 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <p class="font-semibold text-sm text-foreground leading-tight">{{ app.company }}</p>
          <p class="text-xs text-muted-foreground">{{ app.role }}</p>
          <p v-if="app.salary_range" class="text-xs text-emerald-500">{{ app.salary_range }}</p>
          <p v-if="app.applied_date" class="text-[10px] text-muted-foreground/60 font-mono">{{ app.applied_date }}</p>

          <!-- Move buttons -->
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="next in COLUMNS.filter(c => c.key !== col.key)"
              :key="next.key"
              class="text-[10px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded border border-border hover:border-primary/40 transition-colors"
              @click="moveStage(app.id as string, next.key)"
            >
              → {{ next.label }}
            </button>
          </div>
        </div>

        <div v-if="!byStage[col.key]?.length" class="text-xs text-muted-foreground/50 text-center py-4">
          Empty
        </div>
      </div>
    </div>

    <UModal v-model:open="showModal" title="Add Application">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="addApplication">
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Company">
              <UInput v-model="form.company" placeholder="Google" required class="w-full" />
            </UFormField>
            <UFormField label="Role">
              <UInput v-model="form.role" placeholder="Cloud Engineer" required class="w-full" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Applied Date">
              <UInput v-model="form.applied_date" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Salary Range">
              <UInput v-model="form.salary_range" placeholder="KES 120k–180k" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Job URL">
            <UInput v-model="form.job_url" placeholder="https://..." class="w-full" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" placeholder="Recruiter name, interview notes..." class="w-full" />
          </UFormField>
          <UButton type="submit" class="mx-auto block">Add to Pipeline</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
