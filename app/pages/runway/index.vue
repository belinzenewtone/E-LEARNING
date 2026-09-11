<script setup lang="ts">
import type { Database } from '../../../types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

type Snapshot = Database['public']['Tables']['financial_snapshots']['Row']

const supabase = useSupabaseClient<Database>()

const { data: snapshots, pending: runwayPending, refresh } = useAsyncData('financial-snapshots', async () => {
  const { data } = await supabase
    .from('financial_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
  return (data ?? []) as Snapshot[]
})

const latest = computed(() => snapshots.value?.[0] ?? null)

const showModal = ref(false)
const form = reactive({
  snapshot_date: new Date().toISOString().split('T')[0],
  savings_ksh: 0,
  monthly_burn_ksh: 0,
  monthly_income_ksh: 0,
  notes: ''
})

const monthsRunway = computed(() => {
  if (!form.monthly_burn_ksh || !form.savings_ksh) return null
  const net_burn = form.monthly_burn_ksh - form.monthly_income_ksh
  if (net_burn <= 0) return '∞'
  return (form.savings_ksh / net_burn).toFixed(1)
})

async function addSnapshot() {
  const net_burn = form.monthly_burn_ksh - form.monthly_income_ksh
  const months_remaining = net_burn <= 0 ? 99 : Number((form.savings_ksh / net_burn).toFixed(1))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('financial_snapshots').insert({
    snapshot_date: form.snapshot_date,
    savings_ksh: form.savings_ksh,
    monthly_burn_ksh: form.monthly_burn_ksh,
    monthly_income_ksh: form.monthly_income_ksh,
    monthly_burn: form.monthly_burn_ksh,
    months_remaining,
    notes: form.notes || null
  })
  await refresh()
  showModal.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Financial Runway</h1>
        <p class="text-sm text-muted-foreground mt-1">Monthly burn rate, savings, and how long you can go</p>
      </div>
      <UButton icon="i-lucide-plus" @click="showModal = true">Log Snapshot</UButton>
    </div>

    <!-- Latest runway stat -->
    <div v-if="latest" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-border bg-card p-5 space-y-1">
        <p class="text-xs text-muted-foreground">Months Runway</p>
        <p class="text-3xl font-bold" :class="(latest.months_remaining ?? 0) > 6 ? 'text-emerald-500' : (latest.months_remaining ?? 0) > 3 ? 'text-yellow-500' : 'text-red-500'">
          {{ latest.months_remaining }}
        </p>
        <p class="text-xs text-muted-foreground">months</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 space-y-1">
        <p class="text-xs text-muted-foreground">Savings</p>
        <p class="text-2xl font-bold text-foreground">KES {{ latest.savings_ksh?.toLocaleString() }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 space-y-1">
        <p class="text-xs text-muted-foreground">Monthly Burn</p>
        <p class="text-2xl font-bold text-foreground">KES {{ latest.monthly_burn_ksh?.toLocaleString() }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5 space-y-1">
        <p class="text-xs text-muted-foreground">Monthly Income</p>
        <p class="text-2xl font-bold text-foreground">KES {{ latest.monthly_income_ksh?.toLocaleString() }}</p>
      </div>
    </div>

    <div v-if="!latest" class="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      No financial snapshots yet. Log your first one to start tracking runway.
    </div>

    <!-- History -->
    <div v-if="snapshots?.length" class="space-y-2">
      <h2 class="text-sm font-semibold text-foreground">History</h2>
      <div class="rounded-xl border border-border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/40">
            <tr>
              <th class="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Date</th>
              <th class="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Savings</th>
              <th class="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Burn</th>
              <th class="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Income</th>
              <th class="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Runway</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="snap in snapshots"
              :key="snap.id"
              class="border-t border-border"
            >
              <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ snap.snapshot_date }}</td>
              <td class="px-4 py-2.5 text-right text-xs">{{ snap.savings_ksh?.toLocaleString() }}</td>
              <td class="px-4 py-2.5 text-right text-xs">{{ snap.monthly_burn_ksh?.toLocaleString() }}</td>
              <td class="px-4 py-2.5 text-right text-xs">{{ snap.monthly_income_ksh?.toLocaleString() }}</td>
              <td class="px-4 py-2.5 text-right font-semibold text-xs" :class="(snap.months_remaining ?? 0) > 6 ? 'text-emerald-500' : (snap.months_remaining ?? 0) > 3 ? 'text-yellow-500' : 'text-red-500'">
                {{ snap.months_remaining }} mo
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UModal v-model:open="showModal" title="Log Financial Snapshot">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="addSnapshot">
          <UFormField label="Date">
            <UInput v-model="form.snapshot_date" type="date" required class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Savings (KES)">
              <UInput v-model.number="form.savings_ksh" type="number" placeholder="500000" class="w-full" />
            </UFormField>
            <UFormField label="Monthly Burn (KES)">
              <UInput v-model.number="form.monthly_burn_ksh" type="number" placeholder="80000" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Monthly Income (KES)">
            <UInput v-model.number="form.monthly_income_ksh" type="number" placeholder="0 if on study leave" class="w-full" />
          </UFormField>
          <div v-if="monthsRunway" class="rounded-lg bg-muted p-3 text-center">
            <p class="text-xs text-muted-foreground">Estimated runway</p>
            <p class="text-2xl font-bold text-foreground mt-1">{{ monthsRunway }} months</p>
          </div>
          <UFormField label="Notes">
            <UTextarea v-model="form.notes" placeholder="Any context about this month..." class="w-full" />
          </UFormField>
          <UButton type="submit" class="mx-auto block">Save Snapshot</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
