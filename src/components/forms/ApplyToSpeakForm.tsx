import { useState, type ReactNode } from 'react'
import { EVENT, HEARD_FROM, SPEAKER_TRACKS } from '../../data/site'
import { addSpeaker, type SpeakerSubmission } from '../../lib/submissions'
import { Field, FormNav, SelectInput, StepDots, TextArea, TextInput } from './Fields'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s]{8,15}$/
const URL_RE = /^https?:\/\/.+\..+/

type Values = {
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

const initial: Values = {
  talkTitle: '',
  track: SPEAKER_TRACKS[0],
  oneLiner: '',
  fullName: '',
  email: '',
  phone: '',
  role: '',
  bio: '',
  links: '',
  videoUrl: '',
  heardFrom: HEARD_FROM[0],
}

const STEP_TITLES = ['Your talk', 'About you', 'Links', 'Review']

export default function ApplyToSpeakForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [v, setV] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [receipt, setReceipt] = useState<SpeakerSubmission | null>(null)

  const set = <K extends keyof Values>(k: K, val: Values[K]) =>
    setV((s) => ({ ...s, [k]: val }))

  function validateStep(): boolean {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (v.talkTitle.trim().length < 4) e.talkTitle = 'Give your talk a working title.'
      if (v.oneLiner.trim().length < 20)
        e.oneLiner = 'A little more — 20 characters minimum.'
    }
    if (step === 1) {
      if (v.fullName.trim().length < 2) e.fullName = 'Please enter your name.'
      if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address.'
      if (!PHONE_RE.test(v.phone)) e.phone = 'Enter a valid phone number.'
      if (v.role.trim().length < 2) e.role = 'What do you currently do?'
      if (v.bio.trim().length < 40) e.bio = 'A 1–2 line bio, please (40 characters min).'
    }
    if (step === 2) {
      if (!URL_RE.test(v.links)) e.links = 'A link starting with http(s):// helps us know you.'
      if (v.videoUrl && !URL_RE.test(v.videoUrl)) e.videoUrl = 'That doesn’t look like a URL.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep()) return
    if (step === 3) {
      setReceipt(addSpeaker(v))
      setStep(4)
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div>
      {step < 4 && (
        <div className="mb-5 flex items-center justify-between">
          <StepDots total={4} current={step} />
          <span className="text-xs text-white/45">{STEP_TITLES[step]}</span>
        </div>
      )}

      {step === 0 && (
        <Step>
          <div className="space-y-4">
            <Field label="Proposed talk title" required error={errors.talkTitle}>
              {(id) => (
                <TextInput
                  id={id}
                  value={v.talkTitle}
                  error={errors.talkTitle}
                  onChange={(e) => set('talkTitle', e.target.value)}
                  placeholder="The barrier I stopped defending"
                />
              )}
            </Field>
            <Field label="Which track does it fit?" required>
              {(id) => (
                <SelectInput
                  id={id}
                  value={v.track}
                  onChange={(e) => set('track', e.target.value)}
                >
                  {SPEAKER_TRACKS.map((t) => (
                    <option key={t} value={t} className="bg-ink-soft">
                      {t}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field
              label="The idea in one or two sentences"
              required
              error={errors.oneLiner}
              hint={`${v.oneLiner.trim().length} characters`}
            >
              {(id) => (
                <TextArea
                  id={id}
                  value={v.oneLiner}
                  error={errors.oneLiner}
                  onChange={(e) => set('oneLiner', e.target.value)}
                  placeholder="What's the single idea worth spreading, and why now?"
                />
              )}
            </Field>
          </div>
        </Step>
      )}

      {step === 1 && (
        <Step>
          <div className="space-y-4">
            <Field label="Full name" required error={errors.fullName}>
              {(id) => (
                <TextInput
                  id={id}
                  value={v.fullName}
                  error={errors.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  autoComplete="name"
                />
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required error={errors.email}>
                {(id) => (
                  <TextInput
                    id={id}
                    type="email"
                    value={v.email}
                    error={errors.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="email"
                  />
                )}
              </Field>
              <Field label="Phone" required error={errors.phone}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={v.phone}
                    error={errors.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    autoComplete="tel"
                  />
                )}
              </Field>
            </div>
            <Field label="Current role / affiliation" required error={errors.role}>
              {(id) => (
                <TextInput
                  id={id}
                  value={v.role}
                  error={errors.role}
                  onChange={(e) => set('role', e.target.value)}
                  placeholder="Final-year CSE, IGDTUW / Founder, ___"
                />
              )}
            </Field>
            <Field
              label="Short bio"
              required
              error={errors.bio}
              hint="How you'd be introduced on stage"
            >
              {(id) => (
                <TextArea
                  id={id}
                  value={v.bio}
                  error={errors.bio}
                  onChange={(e) => set('bio', e.target.value)}
                />
              )}
            </Field>
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step>
          <div className="space-y-4">
            <Field
              label="A link that represents you"
              required
              error={errors.links}
              hint="LinkedIn, portfolio, Substack, GitHub — anything"
            >
              {(id) => (
                <TextInput
                  id={id}
                  value={v.links}
                  error={errors.links}
                  onChange={(e) => set('links', e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                />
              )}
            </Field>
            <Field
              label="Video of you speaking"
              error={errors.videoUrl}
              hint="Optional, but it helps a lot"
            >
              {(id) => (
                <TextInput
                  id={id}
                  value={v.videoUrl}
                  error={errors.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/…"
                />
              )}
            </Field>
            <Field label="How did you hear about applications?">
              {(id) => (
                <SelectInput
                  id={id}
                  value={v.heardFrom}
                  onChange={(e) => set('heardFrom', e.target.value)}
                >
                  {HEARD_FROM.map((h) => (
                    <option key={h} value={h} className="bg-ink-soft">
                      {h}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
          </div>
        </Step>
      )}

      {step === 3 && (
        <Step>
          <dl className="divide-y divide-white/10 rounded-xl border border-white/12">
            <Row k="Talk" val={v.talkTitle} />
            <Row k="Track" val={v.track} />
            <Row k="Idea" val={v.oneLiner} />
            <Row k="Name" val={v.fullName} />
            <Row k="Email" val={v.email} />
            <Row k="Phone" val={v.phone} />
            <Row k="Role" val={v.role} />
            <Row k="Bio" val={v.bio} />
            <Row k="Link" val={v.links} />
            {v.videoUrl && <Row k="Speaking video" val={v.videoUrl} />}
          </dl>
          <p className="mt-4 text-xs text-white/45">
            Submitting stores your application locally in this prototype. The curation team would
            review it and reply by email.
          </p>
        </Step>
      )}

      {step === 4 && receipt && (
        <Step>
          <div className="rounded-2xl border border-white/12 bg-black/30 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ted/15 text-ted-bright">
              ✓
            </div>
            <p className="text-lg font-bold">Application received</p>
            <p className="mt-1 font-mono text-sm text-white/60">{receipt.id}</p>
          </div>
          <div className="mt-5 space-y-3 text-sm text-white/70">
            <p>
              Thanks, {v.fullName.split(' ')[0]}. Here’s what happens next:
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 text-white/60">
              <li>The curation team reviews every application against this year’s theme.</li>
              <li>Shortlisted speakers are invited to a 20-minute idea call.</li>
              <li>Final speakers get a coach and a rehearsal slot before {EVENT.date}.</li>
            </ol>
            <p>
              We’ll email <span className="text-white">{v.email}</span> either way.
            </p>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="mt-6 w-full rounded-full bg-white/10 py-3 text-sm font-bold transition hover:bg-white/20
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Done
          </button>
        </Step>
      )}

      {step < 4 && (
        <FormNav
          canGoBack={step > 0}
          onBack={() => {
            setErrors({})
            setStep((s) => Math.max(0, s - 1))
          }}
          onNext={next}
          nextLabel={step === 3 ? 'Submit application' : 'Continue'}
        />
      )}
    </div>
  )
}

function Step({ children }: { children: ReactNode }) {
  return <div className="step-in">{children}</div>
}

function Row({ k, val }: { k: string; val: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="shrink-0 text-white/55">{k}</dt>
      <dd className="max-w-[70%] text-right break-words text-white/90">{val}</dd>
    </div>
  )
}
