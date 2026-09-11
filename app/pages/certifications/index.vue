<script setup lang="ts">
import type { Database } from '../../../types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

type Cert = Database['public']['Tables']['certifications']['Row']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = useSupabaseClient() as any

const { data: certs, pending: certsPending, refresh } = useAsyncData('certifications', async () => {
  const { data } = await sb
    .from('certifications')
    .select('*')
    .order('target_date', { ascending: true })
  return (data ?? []) as Cert[]
})

const statusColor: Record<string, string> = {
  planned:     'text-muted-foreground',
  in_progress: 'text-blue-500',
  completed:   'text-emerald-500',
  failed:      'text-red-500'
}

const statusBadge: Record<string, 'neutral' | 'info' | 'success' | 'error'> = {
  planned:     'neutral',
  in_progress: 'info',
  completed:   'success',
  failed:      'error'
}

// Add cert modal
const showModal = ref(false)
const form = reactive({
  name: '',
  vendor: '',
  target_date: '',
  cost_usd: 0,
  status: 'planned',
  notes: ''
})

async function addCert() {
  await sb.from('certifications').insert({ ...form })
  await refresh()
  showModal.value = false
  Object.assign(form, { name: '', vendor: '', target_date: '', cost_usd: 0, status: 'planned', notes: '' })
}

async function updateStatus(id: string, status: string) {
  await sb.from('certifications').update({ status }).eq('id', id)
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Certifications</h1>
        <p class="text-sm text-muted-foreground mt-1">Track your AWS SAA → Terraform → CKA path</p>
      </div>
      <UButton icon="i-lucide-plus" @click="showModal = true">Add Certification</UButton>
    </div>

    <!-- Cert cards -->
    <div class="grid gap-4">
      <template v-if="certsPending">
        <div v-for="n in 3" :key="n" class="rounded-xl border border-border bg-card p-5 flex items-start gap-5">
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-56 rounded" />
            <div class="skeleton h-3 w-32 rounded" />
            <div class="skeleton h-3 w-48 rounded" />
          </div>
        </div>
      </template>
      <template v-else>
      <div
        v-for="cert in certs"
        :key="cert.id"
        class="rounded-xl border border-border bg-card p-5 flex items-start gap-5"
      >
        <div class="flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm text-foreground">{{ cert.name }}</span>
            <UBadge :color="statusBadge[cert.status]" size="xs">{{ cert.status.replace('_', ' ') }}</UBadge>
          </div>
          <p class="text-xs text-muted-foreground">{{ cert.vendor }}</p>
          <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span v-if="cert.target_date">
              <UIcon name="i-lucide-calendar" class="h-3 w-3 inline mr-1" />
              Target: {{ cert.target_date }}
            </span>
            <span v-if="cert.cost_usd">
              <UIcon name="i-lucide-dollar-sign" class="h-3 w-3 inline mr-1" />
              ${{ cert.cost_usd }}
            </span>
            <span v-if="cert.passed_date" class="text-emerald-500">
              <UIcon name="i-lucide-check-circle" class="h-3 w-3 inline mr-1" />
              Passed {{ cert.passed_date }}
            </span>
          </div>
          <p v-if="cert.notes" class="text-xs text-muted-foreground/80 mt-1">{{ cert.notes }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <UButton
            v-if="cert.status !== 'completed'"
            size="xs"
            variant="soft"
            color="success"
            icon="i-lucide-check"
            @click="updateStatus(cert.id, 'completed')"
          >
            Mark done
          </UButton>
          <UButton
            v-if="cert.status === 'planned'"
            size="xs"
            variant="soft"
            color="info"
            @click="updateStatus(cert.id, 'in_progress')"
          >
            Start
          </UButton>
        </div>
      </div>

      <div v-if="!certs?.length" class="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No certifications yet. Click "Add Certification" to track your first one.
      </div>
      </template>
    </div>

    <!-- Add modal -->
    <UModal v-model:open="showModal" title="Add Certification">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="addCert">
          <UFormField label="Certification Name">
            <UInput v-model="form.name" placeholder="AWS Solutions Architect Associate" required class="w-full" />
          </UFormField>
          <UFormField label="Vendor">
            <UInput v-model="form.vendor" placeholder="Amazon Web Services" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Target Date">
              <UInput v-model="form.target_date" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Cost (USD)">
              <UInput v-model.number="form.cost_usd" type="number" placeholder="300" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" placeholder="Study resources, exam booking link..." class="w-full" />
          </UFormField>
          <UButton type="submit" class="mx-auto block">Add Certification</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
