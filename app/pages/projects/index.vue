<script setup lang="ts">
import type { Database } from '../../../types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

type Project = Database['public']['Tables']['projects']['Row'] & {
  project_checklist: Database['public']['Tables']['project_checklist']['Row'][]
}

const supabase = useSupabaseClient<Database>()

const { data: projects, pending: projectsPending, refresh } = useAsyncData('projects', async () => {
  const { data } = await supabase
    .from('projects')
    .select('*, project_checklist(*)')
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any as Project[]
})

const showModal = ref(false)
const form = reactive({ name: '', description: '', repo_url: '', live_url: '', tech_stack: '' })

const CHECKLIST_ITEMS = [
  'Problem defined clearly',
  'Architecture diagram drawn',
  'Repo created and README written',
  'MVP built and working locally',
  'Tests written (unit/integration)',
  'Deployed to cloud (Vercel/AWS/GCP)',
  'Case study written',
  'Added to portfolio/CV'
]

async function addProject() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: proj } = await sb
    .from('projects')
    .insert({
      name: form.name,
      description: form.description,
      repo_url: form.repo_url,
      live_url: form.live_url,
      tech_stack: form.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
    })
    .select()
    .single()

  if (proj) {
    await sb.from('project_checklist').insert(
      CHECKLIST_ITEMS.map((item, i) => ({ project_id: proj.id, item, order: i, completed: false }))
    )
  }
  await refresh()
  showModal.value = false
  Object.assign(form, { name: '', description: '', repo_url: '', live_url: '', tech_stack: '' })
}

async function toggleChecklist(id: string, completed: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('project_checklist').update({ completed: !completed }).eq('id', id)
  await refresh()
}

function checklistProgress(proj: Project) {
  const items = proj.project_checklist ?? []
  if (!items.length) return 0
  return Math.round((items.filter(i => i.completed).length / items.length) * 100)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Projects</h1>
        <p class="text-sm text-muted-foreground mt-1">8-step checklist — idea to portfolio-ready</p>
      </div>
      <UButton icon="i-lucide-plus" @click="showModal = true">New Project</UButton>
    </div>

    <div class="grid gap-5">
      <!-- Skeleton -->
      <template v-if="projectsPending">
        <div v-for="n in 2" :key="n" class="rounded-xl border border-border bg-card p-5 space-y-4">
          <div class="skeleton h-4 w-48 rounded" />
          <div class="skeleton h-2 w-full rounded" />
          <div class="skeleton h-1.5 w-full rounded" />
          <div class="grid grid-cols-2 gap-2">
            <div v-for="i in 8" :key="i" class="skeleton h-3 w-full rounded" />
          </div>
        </div>
      </template>
      <template v-else>
      <div
        v-for="proj in projects"
        :key="proj.id"
        class="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-foreground">{{ proj.name }}</h3>
            <p class="text-xs text-muted-foreground mt-1">{{ proj.description }}</p>
            <div class="flex gap-2 mt-2">
              <a v-if="proj.repo_url" :href="proj.repo_url" target="_blank" class="text-xs text-primary hover:underline flex items-center gap-1">
                <UIcon name="i-lucide-github" class="h-3 w-3" /> Repo
              </a>
              <a v-if="proj.live_url" :href="proj.live_url" target="_blank" class="text-xs text-primary hover:underline flex items-center gap-1">
                <UIcon name="i-lucide-external-link" class="h-3 w-3" /> Live
              </a>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-foreground">{{ checklistProgress(proj) }}%</p>
            <p class="text-xs text-muted-foreground">complete</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1.5 bg-muted rounded overflow-hidden">
          <div class="h-full bg-primary rounded transition-all duration-500" :style="{ width: checklistProgress(proj) + '%' }" />
        </div>

        <!-- Checklist -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <label
            v-for="item in proj.project_checklist"
            :key="item.id"
            class="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              :checked="item.completed"
              class="accent-primary"
              @change="toggleChecklist(item.id, item.completed)"
            >
            <span :class="['text-xs', item.completed ? 'line-through text-muted-foreground' : 'text-foreground']">
              {{ item.item }}
            </span>
          </label>
        </div>

        <!-- Tech stack -->
        <div v-if="proj.tech_stack?.length" class="flex flex-wrap gap-1">
          <UBadge v-for="tech in proj.tech_stack" :key="tech" size="xs" color="neutral">{{ tech }}</UBadge>
        </div>
      </div>

      <div v-if="!projects?.length" class="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No projects yet. Start your first one!
      </div>
      </template>
    </div>

    <UModal v-model:open="showModal" title="New Project">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="addProject">
          <UFormField label="Project Name">
            <UInput v-model="form.name" placeholder="Cloud Resume Challenge" required class="w-full" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="form.description" placeholder="What are you building?" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Repo URL">
              <UInput v-model="form.repo_url" placeholder="https://github.com/..." class="w-full" />
            </UFormField>
            <UFormField label="Live URL">
              <UInput v-model="form.live_url" placeholder="https://..." class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Tech Stack (comma-separated)">
            <UInput v-model="form.tech_stack" placeholder="AWS, Terraform, Python, Nuxt" class="w-full" />
          </UFormField>
          <UButton type="submit" class="mx-auto block">Create Project</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
