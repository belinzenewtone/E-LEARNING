<script setup lang="ts">
import type { Database } from '../../../types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

type CaseStudy = Database['public']['Tables']['case_studies']['Row']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = useSupabaseClient() as any

const { data: caseStudies, pending: casesPending, refresh } = useAsyncData('case-studies', async () => {
  const { data } = await sb
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as CaseStudy[]
})

const showModal = ref(false)
const editing = ref<Record<string, unknown> | null>(null)
const form = reactive({ title: '', summary: '', challenge: '', solution: '', outcome: '', tags: '' })

function openNew() {
  editing.value = null
  Object.assign(form, { title: '', summary: '', challenge: '', solution: '', outcome: '', tags: '' })
  showModal.value = true
}

function openEdit(cs: Record<string, unknown>) {
  editing.value = cs
  Object.assign(form, {
    title: cs.title,
    summary: cs.summary,
    challenge: cs.challenge,
    solution: cs.solution,
    outcome: cs.outcome,
    tags: (cs.tags as string[])?.join(', ') ?? ''
  })
  showModal.value = true
}

async function saveStudy() {
  const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
  const payload = { title: form.title, summary: form.summary, challenge: form.challenge, solution: form.solution, outcome: form.outcome, tags }
  if (editing.value) {
    await sb.from('case_studies').update(payload).eq('id', editing.value.id)
  } else {
    await sb.from('case_studies').insert(payload)
  }
  await refresh()
  showModal.value = false
}

async function deleteStudy(id: string) {
  if (!confirm('Delete this case study? This cannot be undone.')) return
  await sb.from('case_studies').delete().eq('id', id)
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Case Studies</h1>
        <p class="text-sm text-muted-foreground mt-1">Write up what you built, why, and what you learned</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openNew">New Case Study</UButton>
    </div>

    <div class="grid gap-5">
      <div
        v-for="cs in caseStudies"
        :key="cs.id"
        class="rounded-xl border border-border bg-card p-6 space-y-3"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-foreground">{{ cs.title }}</h3>
            <p class="text-xs text-muted-foreground mt-1">{{ cs.summary }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(cs)" />
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click="deleteStudy(cs.id)" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-lg bg-muted/40 p-3">
            <p class="text-[10px] font-mono uppercase text-muted-foreground mb-1">Challenge</p>
            <p class="text-xs text-foreground">{{ cs.challenge }}</p>
          </div>
          <div class="rounded-lg bg-muted/40 p-3">
            <p class="text-[10px] font-mono uppercase text-muted-foreground mb-1">Solution</p>
            <p class="text-xs text-foreground">{{ cs.solution }}</p>
          </div>
          <div class="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
            <p class="text-[10px] font-mono uppercase text-emerald-500 mb-1">Outcome</p>
            <p class="text-xs text-foreground">{{ cs.outcome }}</p>
          </div>
        </div>

        <div v-if="cs.tags?.length" class="flex flex-wrap gap-1">
          <UBadge v-for="tag in cs.tags" :key="tag" size="xs" color="neutral">{{ tag }}</UBadge>
        </div>

        <p class="text-[10px] font-mono text-muted-foreground/60">
          {{ new Date(cs.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) }}
        </p>
      </div>

      <div v-if="!caseStudies?.length" class="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No case studies yet. Document your first project!
      </div>
    </div>

    <UModal v-model:open="showModal" :title="editing ? 'Edit Case Study' : 'New Case Study'" class="max-w-2xl">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="saveStudy">
          <UFormField label="Title">
            <UInput v-model="form.title" placeholder="Cloud Resume Challenge on AWS" required class="w-full" />
          </UFormField>
          <UFormField label="Summary (one line)">
            <UInput v-model="form.summary" placeholder="Built a serverless resume site using S3, CloudFront, Lambda, DynamoDB" class="w-full" />
          </UFormField>
          <UFormField label="Challenge">
            <UTextarea v-model="form.challenge" placeholder="What was the problem or skill you wanted to prove?" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Solution">
            <UTextarea v-model="form.solution" placeholder="How did you approach it? What did you build?" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Outcome">
            <UTextarea v-model="form.outcome" placeholder="What did you ship? What did you learn?" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Tags (comma-separated)">
            <UInput v-model="form.tags" placeholder="AWS, S3, Lambda, Terraform, Python" class="w-full" />
          </UFormField>
          <UButton type="submit" class="mx-auto block">{{ editing ? 'Save Changes' : 'Create Case Study' }}</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
