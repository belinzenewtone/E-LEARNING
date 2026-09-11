<script setup lang="ts">
import type { Database } from '../../../types/database.types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

const supabase = useSupabaseClient<Database>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any

const { data: logs, pending: logsPending, refresh } = useAsyncData('daily-logs', async () => {
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .order('log_date', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any as DailyLog[]
})

const today = new Date().toISOString().split('T')[0]
const todayLog = computed(() => logs.value?.find(l => l.log_date === today))

/* ── Today's form ───────────────────────────────────────────── */
const form = reactive({
  log_date: today,
  outputs: '',
  energy_level: 3,
  mood: '',
  blockers: '',
  next_focus: '',
  notes: ''
})

watchEffect(() => {
  if (todayLog.value) {
    form.log_date     = todayLog.value.log_date
    form.outputs      = todayLog.value.outputs?.join(', ') ?? ''
    form.energy_level = todayLog.value.energy_level ?? 3
    form.mood         = todayLog.value.mood ?? ''
    form.blockers     = todayLog.value.blockers ?? ''
    form.next_focus   = todayLog.value.next_focus ?? ''
    form.notes        = todayLog.value.notes ?? ''
  }
})

const saveError = ref('')

function validateForm(f: typeof form | typeof editForm) {
  const outputs = f.outputs.split(',').map((s: string) => s.trim()).filter(Boolean)
  if (!outputs.length)        return 'Add at least one output before saving.'
  if (!f.mood.trim())         return 'Mood is required.'
  if (!f.blockers.trim())     return 'Blockers is required (write "none" if clear).'
  if (!f.next_focus.trim())   return "Tomorrow's Focus is required."
  return null
}

async function saveLog() {
  const err = validateForm(form)
  if (err) { saveError.value = err; return }
  saveError.value = ''
  const outputs = form.outputs.split(',').map((s: string) => s.trim()).filter(Boolean)
  const payload = {
    log_date:     form.log_date as string,
    outputs,
    energy_level: form.energy_level,
    mood:         form.mood,
    blockers:     form.blockers,
    next_focus:   form.next_focus,
    notes:        form.notes || null
  }
  if (todayLog.value) {
    await sb.from('daily_logs').update(payload).eq('id', todayLog.value.id)
  } else {
    await sb.from('daily_logs').insert(payload)
  }
  await refresh()
}

/* ── Edit modal (any past log) ──────────────────────────────── */
const showEditModal = ref(false)
const editTarget    = ref<DailyLog | null>(null)
const editError     = ref('')

const editForm = reactive({
  log_date: '',
  outputs: '',
  energy_level: 3,
  mood: '',
  blockers: '',
  next_focus: '',
  notes: ''
})

function openEdit(log: DailyLog) {
  editTarget.value     = log
  editForm.log_date    = log.log_date
  editForm.outputs     = (log.outputs as string[])?.join(', ') ?? ''
  editForm.energy_level = log.energy_level ?? 3
  editForm.mood        = log.mood ?? ''
  editForm.blockers    = log.blockers ?? ''
  editForm.next_focus  = log.next_focus ?? ''
  editForm.notes       = log.notes ?? ''
  editError.value      = ''
  showEditModal.value  = true
}

async function saveEdit() {
  const err = validateForm(editForm)
  if (err) { editError.value = err; return }
  editError.value = ''
  const outputs = editForm.outputs.split(',').map((s: string) => s.trim()).filter(Boolean)
  await sb.from('daily_logs').update({
    outputs,
    energy_level: editForm.energy_level,
    mood:         editForm.mood,
    blockers:     editForm.blockers,
    next_focus:   editForm.next_focus,
    notes:        editForm.notes || null
  }).eq('id', editTarget.value!.id)
  await refresh()
  showEditModal.value = false
}

/* ── Delete ─────────────────────────────────────────────────── */
async function deleteLog(id: string) {
  if (!confirm('Delete this log entry? This cannot be undone.')) return
  await sb.from('daily_logs').delete().eq('id', id)
  await refresh()
}

/* ── UI helpers ─────────────────────────────────────────────── */
const energyLabels: Record<number, string> = { 1: 'Drained', 2: 'Low', 3: 'OK', 4: 'Good', 5: 'Energised' }
const energyColor:  Record<number, string> = {
  1: 'text-red-500', 2: 'text-orange-500', 3: 'text-yellow-500', 4: 'text-emerald-400', 5: 'text-emerald-500'
}

const openLogs = ref<Set<string>>(new Set())
function toggleLog(id: string) {
  const next = new Set(openLogs.value)
  next.has(id) ? next.delete(id) : next.add(id)
  openLogs.value = next
}
</script>

<template>
  <div class="space-y-8 max-w-2xl">
    <div>
      <h1 class="text-xl font-bold">Daily Output Log</h1>
      <p class="text-sm text-muted-foreground mt-1">Track outputs, not hours — what did you actually build/learn today?</p>
    </div>

    <!-- Today's form -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-5">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-foreground">{{ today === form.log_date ? "Today's Log" : form.log_date }}</h2>
        <UBadge v-if="todayLog" color="success" size="xs">Saved</UBadge>
      </div>

      <form class="space-y-5" @submit.prevent="saveLog">
        <UFormField label="Outputs *" description="What did you ship, learn, or complete? (comma-separated)">
          <UTextarea
            v-model="form.outputs"
            placeholder="Finished AWS IAM module, wrote S3 bucket Terraform, read Python chapter 5"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Energy Level</label>
          <div class="flex items-center gap-3">
            <input v-model.number="form.energy_level" type="range" min="1" max="5" step="1" class="flex-1 accent-primary" />
            <span :class="['text-sm font-semibold w-24 shrink-0', energyColor[form.energy_level]]">
              {{ form.energy_level }}/5 — {{ energyLabels[form.energy_level] }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Mood *">
            <UInput v-model="form.mood" placeholder="Focused, distracted, tired…" class="w-full" />
          </UFormField>
          <UFormField label="Tomorrow's Focus *">
            <UInput v-model="form.next_focus" placeholder="What's the #1 thing tomorrow?" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Blockers *" description='Write "none" if clear'>
          <UInput v-model="form.blockers" placeholder="Anything slowing you down?" class="w-full" />
        </UFormField>

        <UFormField label="Notes (optional)">
          <UTextarea v-model="form.notes" placeholder="Anything else worth noting…" class="w-full" :rows="2" />
        </UFormField>

        <p v-if="saveError" class="text-xs text-red-500 text-center font-medium">{{ saveError }}</p>
        <UButton type="submit" class="mx-auto block">
          {{ todayLog ? 'Update Log' : 'Save Log' }}
        </UButton>
      </form>
    </div>

    <!-- Log history -->
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-foreground">Log History</h2>
      <div class="space-y-2">
        <template v-if="logsPending">
          <div v-for="n in 3" :key="n" class="rounded-xl border border-border bg-card p-4 space-y-2">
            <div class="flex items-center gap-3">
              <div class="skeleton h-3 w-20 rounded shrink-0" />
              <div class="skeleton h-3 flex-1 rounded" />
              <div class="skeleton h-3 w-8 rounded" />
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="log in logs"
            :key="log.id"
            class="rounded-xl border border-border bg-card overflow-hidden"
          >
            <!-- Summary row -->
            <div
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
              @click="toggleLog(log.id)"
            >
              <p class="text-xs font-mono text-muted-foreground shrink-0 w-24">{{ log.log_date }}</p>
              <div class="flex-1 flex flex-wrap gap-1 min-w-0">
                <UBadge v-for="out in (log.outputs as string[])" :key="out" size="xs" color="neutral">{{ out }}</UBadge>
                <span v-if="!(log.outputs as string[])?.length" class="text-xs text-muted-foreground/60 italic">no outputs</span>
              </div>
              <span :class="['text-xs font-semibold shrink-0', energyColor[log.energy_level ?? 3]]">⚡{{ log.energy_level }}</span>
              <UIcon :name="openLogs.has(log.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            <!-- Expanded detail -->
            <Transition name="slide">
              <div v-if="openLogs.has(log.id)" class="border-t border-border px-4 py-4 space-y-3 bg-muted/10">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">Mood</p>
                    <p class="text-sm text-foreground">{{ log.mood || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">Tomorrow's Focus</p>
                    <p class="text-sm text-foreground">{{ log.next_focus || '—' }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">Blockers</p>
                  <p class="text-sm text-foreground">{{ log.blockers || '—' }}</p>
                </div>
                <div v-if="log.notes">
                  <p class="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">Notes</p>
                  <p class="text-sm text-foreground">{{ log.notes }}</p>
                </div>
                <div v-if="(log.outputs as string[])?.length">
                  <p class="text-[10px] font-mono uppercase text-muted-foreground mb-1">All Outputs</p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge v-for="out in (log.outputs as string[])" :key="out" size="xs" color="primary">{{ out }}</UBadge>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 pt-1 border-t border-border">
                  <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click.stop="openEdit(log)">
                    Edit
                  </UButton>
                  <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2" @click.stop="deleteLog(log.id)">
                    Delete
                  </UButton>
                </div>
              </div>
            </Transition>
          </div>

          <div v-if="!logs?.length" class="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            No logs yet. Fill in today's form above.
          </div>
        </template>
      </div>
    </div>

    <!-- Edit modal -->
    <UModal v-model:open="showEditModal" :title="`Edit Log — ${editTarget?.log_date}`">
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="saveEdit">
          <UFormField label="Outputs *" description="Comma-separated">
            <UTextarea v-model="editForm.outputs" :rows="3" class="w-full" />
          </UFormField>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Energy Level</label>
            <div class="flex items-center gap-3">
              <input v-model.number="editForm.energy_level" type="range" min="1" max="5" step="1" class="flex-1 accent-primary" />
              <span :class="['text-sm font-semibold w-24 shrink-0', energyColor[editForm.energy_level]]">
                {{ editForm.energy_level }}/5 — {{ energyLabels[editForm.energy_level] }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Mood *">
              <UInput v-model="editForm.mood" class="w-full" />
            </UFormField>
            <UFormField label="Tomorrow's Focus *">
              <UInput v-model="editForm.next_focus" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Blockers *">
            <UInput v-model="editForm.blockers" class="w-full" />
          </UFormField>

          <UFormField label="Notes (optional)">
            <UTextarea v-model="editForm.notes" :rows="2" class="w-full" />
          </UFormField>

          <p v-if="editError" class="text-xs text-red-500 text-center font-medium">{{ editError }}</p>
          <UButton type="submit" class="mx-auto block">Save Changes</UButton>
        </form>
      </template>
    </UModal>
  </div>
</template>
