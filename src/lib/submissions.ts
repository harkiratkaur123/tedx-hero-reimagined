// Tiny persistence layer. The brief scopes the admin/review surface OUT of this
// feature (it's listed as deferred work), so submissions just land in
// localStorage and can be inspected at /dev/submissions during development.

export type TicketSubmission = {
  id: string
  kind: 'ticket'
  createdAt: string
  data: {
    tier: string
    quantity: number
    fullName: string
    email: string
    phone: string
    organisation: string
    dietary: string
  }
}

export type SpeakerSubmission = {
  id: string
  kind: 'speaker'
  createdAt: string
  data: {
    talkTitle: string
    track: string
    oneLiner: string
    fullName: string
    email: string
    phone: string
    role: string
    bio: string
    links: string
    videoUrl: string
    heardFrom: string
  }
}

export type Submission = TicketSubmission | SpeakerSubmission

const KEY = 'tedx_submissions'

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  const stamp = Date.now().toString(36).slice(-4).toUpperCase()
  return `${prefix}-${stamp}${rand}`
}

export function getSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Submission[]) : []
  } catch {
    return []
  }
}

export function addTicket(data: TicketSubmission['data']): TicketSubmission {
  const entry: TicketSubmission = {
    id: makeId('TIX'),
    kind: 'ticket',
    createdAt: new Date().toISOString(),
    data,
  }
  persist(entry)
  return entry
}

export function addSpeaker(data: SpeakerSubmission['data']): SpeakerSubmission {
  const entry: SpeakerSubmission = {
    id: makeId('SPK'),
    kind: 'speaker',
    createdAt: new Date().toISOString(),
    data,
  }
  persist(entry)
  return entry
}

export function clearSubmissions() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

function persist(entry: Submission) {
  try {
    const all = getSubmissions()
    all.unshift(entry)
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable (private mode) — the success screen still shows */
  }
}
