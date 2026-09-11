<script setup lang="ts">
import curriculumRaw from '../../../curriculum.json'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any

/* ── Track metadata (UI colours) ───────────────────────────── */
const TRACK_META: Record<string, { label: string; icon: string; color: string; bg: string; border: string; hours: number }> = {
  python: { label: 'Python',      icon: 'i-lucide-code-2',     color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/20', hours: 110 },
  bash:   { label: 'Bash',        icon: 'i-lucide-terminal',   color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',  hours: 78  },
  aws:    { label: 'Cloud / AWS', icon: 'i-lucide-cloud',      color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20', hours: 133 },
  nuxt:   { label: 'Nuxt',        icon: 'i-lucide-layers',     color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20',hours: 116 }
}
const TRACK_KEYS = ['python', 'bash', 'aws', 'nuxt'] as const
type TrackKey = typeof TRACK_KEYS[number]

/* ── Curriculum data ────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const curriculum = curriculumRaw as any

/* ── Active track ───────────────────────────────────────────── */
const activeTrack = ref<TrackKey>('python')

/* ── DB: topic statuses ─────────────────────────────────────── */
type DBTopic = { id: string; track: string; title: string; status: string; content: string | null; resources: string[] }

const { data: dbTopics, pending: topicsPending, refresh } = useAsyncData('learning-topics', async () => {
  const { data } = await sb.from('learning_tracks').select('*')
  return (data ?? []) as DBTopic[]
})

// "track::title" → { id, status }
const statusMap = computed<Record<string, { id: string; status: string }>>(() => {
  const m: Record<string, { id: string; status: string }> = {}
  for (const r of (dbTopics.value ?? [])) {
    m[`${r.track}::${r.title}`] = { id: r.id, status: r.status }
  }
  return m
})

function getStatus(track: string, title: string): string {
  return statusMap.value[`${track}::${title}`]?.status ?? 'todo'
}

async function cycleStatus(track: string, title: string) {
  const key = `${track}::${title}`
  const existing = statusMap.value[key]
  const cur = existing?.status ?? 'todo'
  const next = cur === 'todo' ? 'in_progress' : cur === 'in_progress' ? 'done' : 'todo'
  await setStatus(track, title, next)
}

async function setStatus(track: string, title: string, status: string) {
  const key = `${track}::${title}`
  const existing = statusMap.value[key]
  if (existing?.id) {
    await sb.from('learning_tracks').update({ status, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await sb.from('learning_tracks').insert({ track, title, status, content: null, resources: [] })
  }
  await refresh()
}

/* ── Phase progress ─────────────────────────────────────────── */
function phaseProgress(track: string, topics: { title: string }[]) {
  const done  = topics.filter(t => getStatus(track, t.title) === 'done').length
  const prog  = topics.filter(t => getStatus(track, t.title) === 'in_progress').length
  const total = topics.length
  const pct   = total ? Math.round(((done + prog * 0.5) / total) * 100) : 0
  return { done, prog, total, pct }
}

/* ── Accordion state ────────────────────────────────────────── */
const openTopics = ref<Set<string>>(new Set())
function toggleTopic(key: string) {
  const next = new Set(openTopics.value)
  next.has(key) ? next.delete(key) : next.add(key)
  openTopics.value = next
}
function isTopicOpen(key: string) { return openTopics.value.has(key) }

/* ── Current track data ─────────────────────────────────────── */
const currentTrack = computed(() => curriculum.tracks[activeTrack.value])

/* ── Overall track progress ─────────────────────────────────── */
const trackProgress = computed(() => {
  const t = currentTrack.value
  const allTopics = t.phases.flatMap((p: { topics: { title: string }[] }) => p.topics)
  const done = allTopics.filter((tp: { title: string }) => getStatus(activeTrack.value, tp.title) === 'done').length
  return { done, total: allTopics.length }
})

/* ── Custom topics (not in curriculum) ──────────────────────── */
const curriculumTitleSet = computed(() => {
  const s = new Set<string>()
  const t = currentTrack.value
  for (const p of t.phases) for (const tp of p.topics) s.add(tp.title)
  return s
})

const customTopics = computed(() =>
  (dbTopics.value ?? []).filter(r => r.track === activeTrack.value && !curriculumTitleSet.value.has(r.title))
)

async function cycleCustomStatus(id: string, cur: string) {
  const next = cur === 'todo' ? 'in_progress' : cur === 'in_progress' ? 'done' : 'todo'
  await sb.from('learning_tracks').update({ status: next, updated_at: new Date().toISOString() }).eq('id', id)
  await refresh()
}

/* ── Add topic modal ────────────────────────────────────────── */
const showModal = ref(false)
const form = reactive({ title: '', content: '', resources: '', status: 'todo' })

async function addTopic() {
  await sb.from('learning_tracks').insert({
    track: activeTrack.value,
    title: form.title,
    content: form.content || null,
    resources: form.resources.split('\n').filter(Boolean),
    status: form.status
  })
  await refresh()
  showModal.value = false
  Object.assign(form, { title: '', content: '', resources: '', status: 'todo' })
}

/* ── Helpers ────────────────────────────────────────────────── */
type BadgeColor = 'neutral' | 'info' | 'success'
const statusColor: Record<string, BadgeColor> = { todo: 'neutral', in_progress: 'info', done: 'success' }
const statusIcon: Record<string, string> = {
  todo:        'i-lucide-circle',
  in_progress: 'i-lucide-circle-dot',
  done:        'i-lucide-check-circle-2'
}
const statusIconCls: Record<string, string> = {
  todo:        'text-muted-foreground',
  in_progress: 'text-blue-500',
  done:        'text-emerald-500'
}
</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Learning Tracks</h1>
        <p class="text-sm text-muted-foreground mt-1">Python · Bash · Cloud/AWS · Nuxt — structured curriculum + your own notes</p>
      </div>
      <UButton icon="i-lucide-plus" @click="showModal = true">Add Topic</UButton>
    </div>

    <!-- Track tabs -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="key in TRACK_KEYS"
        :key="key"
        :class="[
          'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
          activeTrack === key
            ? [TRACK_META[key].bg, TRACK_META[key].border, TRACK_META[key].color]
            : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
        ]"
        @click="activeTrack = key"
      >
        <UIcon :name="TRACK_META[key].icon" class="h-4 w-4" />
        {{ TRACK_META[key].label }}
        <span class="ml-1 text-xs opacity-60">~{{ TRACK_META[key].hours }}h</span>
      </button>
    </div>

    <!-- Track overview bar -->
    <div class="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <UIcon :name="TRACK_META[activeTrack].icon" :class="['h-5 w-5 shrink-0', TRACK_META[activeTrack].color]" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">{{ currentTrack.subtitle }}</span>
          <span class="text-xs text-muted-foreground">{{ trackProgress.done }} / {{ trackProgress.total }} topics done</span>
        </div>
        <div class="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            :class="['h-full rounded-full transition-all duration-500', TRACK_META[activeTrack].color.replace('text-', 'bg-')]"
            :style="{ width: trackProgress.total ? `${Math.round((trackProgress.done / trackProgress.total) * 100)}%` : '0%' }"
          />
        </div>
      </div>
    </div>

    <!-- Skeleton while loading -->
    <template v-if="topicsPending">
      <div v-for="n in 3" :key="n" class="rounded-xl border border-border bg-card p-4 space-y-3">
        <div class="skeleton h-3 w-40 rounded" />
        <div class="skeleton h-2 w-full rounded" />
        <div class="skeleton h-2 w-3/4 rounded" />
      </div>
    </template>

    <!-- Phases -->
    <template v-else>
      <div
        v-for="(phase, phIdx) in currentTrack.phases"
        :key="phase.id"
        class="space-y-2"
      >
        <!-- Phase header -->
        <div class="flex items-center gap-3 mb-1">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-muted-foreground uppercase tracking-widest">Phase {{ phIdx + 1 }}</span>
              <h2 class="text-sm font-semibold text-foreground truncate">{{ phase.title.replace(/^Phase \d+ — /, '') }}</h2>
            </div>
            <!-- Phase progress bar -->
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full bg-primary/60 transition-all duration-500"
                  :style="{ width: `${phaseProgress(activeTrack, phase.topics).pct}%` }"
                />
              </div>
              <span class="text-xs text-muted-foreground shrink-0">
                {{ phaseProgress(activeTrack, phase.topics).done }}/{{ phaseProgress(activeTrack, phase.topics).total }}
              </span>
            </div>
          </div>
        </div>

        <!-- Topics -->
        <div
          v-for="(topic, tIdx) in phase.topics"
          :key="`${phase.id}-${tIdx}`"
          class="rounded-xl border border-border bg-card overflow-hidden"
        >
          <!-- Topic row -->
          <div class="flex items-center gap-3 px-4 py-3">
            <!-- Status circle -->
            <button
              class="shrink-0 transition-transform hover:scale-110"
              :title="'Status: ' + getStatus(activeTrack, topic.title)"
              @click.stop="cycleStatus(activeTrack, topic.title)"
            >
              <UIcon
                :name="statusIcon[getStatus(activeTrack, topic.title)]"
                :class="['h-5 w-5 transition-colors', statusIconCls[getStatus(activeTrack, topic.title)]]"
              />
            </button>

            <!-- Title + hours -->
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <p
                :class="[
                  'text-sm font-medium truncate',
                  getStatus(activeTrack, topic.title) === 'done'
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                ]"
              >{{ topic.title }}</p>
              <span class="text-xs text-muted-foreground shrink-0 hidden sm:block">{{ topic.approx_hours }}h</span>
            </div>

            <!-- Status badge -->
            <UBadge :color="statusColor[getStatus(activeTrack, topic.title)]" size="xs" class="shrink-0 hidden sm:flex">
              {{ getStatus(activeTrack, topic.title).replace('_', ' ') }}
            </UBadge>

            <!-- Expand chevron -->
            <button
              class="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              @click="toggleTopic(`${phase.id}-${tIdx}`)"
            >
              <UIcon
                :name="isTopicOpen(`${phase.id}-${tIdx}`) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="h-4 w-4"
              />
            </button>
          </div>

          <!-- Expanded detail -->
          <Transition name="slide">
            <div
              v-if="isTopicOpen(`${phase.id}-${tIdx}`)"
              class="border-t border-border px-4 py-4 space-y-4 bg-muted/20"
            >
              <!-- Why -->
              <div class="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p class="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Why this matters</p>
                <p class="text-sm text-foreground leading-relaxed">{{ topic.why }}</p>
              </div>

              <!-- What you'll do -->
              <div>
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What you'll cover</p>
                <ul class="space-y-1.5">
                  <li
                    v-for="(item, i) in topic.what"
                    :key="i"
                    class="flex items-start gap-2 text-sm text-foreground"
                  >
                    <UIcon name="i-lucide-check" class="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <!-- Mini project -->
              <div class="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p class="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
                  <UIcon name="i-lucide-wrench" class="h-3.5 w-3.5 inline mr-1" />Mini Project
                </p>
                <p class="text-sm text-foreground leading-relaxed">{{ topic.mini_project }}</p>
              </div>

              <!-- Resources -->
              <div v-if="topic.resources?.length">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resources</p>
                <div class="flex flex-wrap gap-2">
                  <a
                    v-for="r in topic.resources"
                    :key="r.url"
                    :href="r.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors"
                  >
                    <UIcon name="i-lucide-external-link" class="h-3 w-3 shrink-0" />
                    {{ r.name }}
                  </a>
                </div>
              </div>

              <!-- Quick status toggle at bottom -->
              <div class="flex items-center gap-2 pt-1 border-t border-border">
                <span class="text-xs text-muted-foreground">Mark as:</span>
                <button
                  v-for="s in ['todo', 'in_progress', 'done']"
                  :key="s"
                  :class="[
                    'rounded-md px-2 py-0.5 text-xs font-medium transition-colors border',
                    getStatus(activeTrack, topic.title) === s
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                  ]"
                  @click="setStatus(activeTrack, topic.title, s)"
                >{{ s.replace('_', ' ') }}</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Custom topics section -->
      <div v-if="customTopics.length" class="space-y-2">
        <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Your Custom Topics</h2>
        <div
          v-for="topic in customTopics"
          :key="topic.id"
          class="rounded-xl border border-border bg-card p-4 flex items-start gap-3"
        >
          <button class="shrink-0 mt-0.5 transition-transform hover:scale-110" @click="cycleCustomStatus(topic.id, topic.status)">
            <UIcon :name="statusIcon[topic.status]" :class="['h-5 w-5', statusIconCls[topic.status]]" />
          </button>
          <div class="flex-1 min-w-0 space-y-1">
            <p :class="['font-medium text-sm', topic.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground']">
              {{ topic.title }}
            </p>
            <p v-if="topic.content" class="text-xs text-muted-foreground">{{ topic.content }}</p>
            <div v-if="topic.resources?.length" class="flex flex-wrap gap-1 mt-1">
              <a
                v-for="url in topic.resources"
                :key="url"
                :href="url"
                target="_blank"
                class="text-xs text-primary hover:underline"
              >{{ url }}</a>
            </div>
          </div>
          <UBadge :color="statusColor[topic.status as keyof typeof statusColor]" size="xs">
            {{ topic.status.replace('_', ' ') }}
          </UBadge>
        </div>
      </div>

      <!-- Empty custom topics hint -->
      <div v-if="!customTopics.length" class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Curriculum loaded · {{ trackProgress.total }} structured topics.
        <button class="text-primary hover:underline ml-1" @click="showModal = true">Add your own topic →</button>
      </div>
    </template>

    <!-- Add Topic Modal -->
    <UModal
      v-model:open="showModal"
      :title="`Add ${TRACK_META[activeTrack].label} Topic`"
    >
      <template #body>
        <form class="space-y-4 p-1" @submit.prevent="addTopic">
          <UFormField label="Topic / Concept">
            <UInput v-model="form.title" placeholder="e.g. Python list comprehensions" required class="w-full" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="form.content" placeholder="What you learned..." class="w-full" :rows="4" />
          </UFormField>
          <UFormField label="Resources (one URL per line)">
            <UTextarea v-model="form.resources" placeholder="https://..." class="w-full" :rows="3" />
          </UFormField>
          <UFormField label="Status">
            <select v-model="form.status" class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </UFormField>
          <UButton type="submit" class="mx-auto block">Add Topic</UButton>
        </form>
      </template>
    </UModal>

  </div>
</template>
