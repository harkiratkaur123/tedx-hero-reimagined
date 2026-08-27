import { useState, type ReactNode } from 'react'
import { EVENT, TICKET_TIERS } from '../../data/site'
import { addTicket, type TicketSubmission } from '../../lib/submissions'
import { Field, FormNav, SelectInput, StepDots, TextInput } from './Fields'
import FauxQR from './FauxQR'

const DIETARY = ['No preference', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s]{8,15}$/

type Values = {
  tier: string
  quantity: number
  fullName: string
  email: string
  phone: string
  organisation: string
  dietary: string
}

const initial: Values = {
  tier: 'student',
  quantity: 1,
  fullName: '',
  email: '',
  phone: '',
  organisation: '',
  dietary: DIETARY[0],
}

export default function GetTicketsForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [v, setV] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [receipt, setReceipt] = useState<TicketSubmission | null>(null)

  const tier = TICKET_TIERS.find((t) => t.id === v.tier)!
  const total = tier.price * v.quantity
  const set = <K extends keyof Values>(k: K, val: Values[K]) =>
    setV((s) => ({ ...s, [k]: val }))

  function validateStep(): boolean {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (v.fullName.trim().length < 2) e.fullName = 'Please enter your name.'
      if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address.'
      if (!PHONE_RE.test(v.phone)) e.phone = 'Enter a valid phone number.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep()) return
    if (step === 2) {
      setReceipt(addTicket(v))
      setStep(3)
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <div>
      {step < 3 && (
        <div className="mb-5">
          <StepDots total={3} current={step} />
        </div>
      )}

      {step === 0 && (
        <Step>
          <p className="mb-4 text-sm text-white/60">
            {EVENT.date} · {EVENT.venue}
          </p>
          <div className="space-y-3">
            {TICKET_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set('tier', t.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  v.tier === t.id
                    ? 'border-ted bg-ted/10'
                    : 'border-white/12 hover:border-white/30'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">{t.name}</span>
                  <span className="text-sm text-white/80">
                    {t.price === 0 ? 'Free' : `₹${t.price}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/55">{t.blurb}</p>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/45">
                  {t.perks.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <Field label="Quantity">
              {(id) => (
                <div className="flex items-center gap-3">
                  <Stepper
                    id={id}
                    value={v.quantity}
                    onChange={(n) => set('quantity', n)}
                  />
                  <span className="text-sm text-white/60">
                    {total === 0 ? 'No charge' : `₹${total} total`}
                  </span>
                </div>
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
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              )}
            </Field>
            <Field label="Email" required error={errors.email}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  value={v.email}
                  error={errors.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="jane@example.com"
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
                  placeholder="+91 90000 00000"
                  autoComplete="tel"
                />
              )}
            </Field>
            <Field label="College / organisation" hint="Optional">
              {(id) => (
                <TextInput
                  id={id}
                  value={v.organisation}
                  onChange={(e) => set('organisation', e.target.value)}
                  placeholder="IGDTUW"
                />
              )}
            </Field>
            <Field label="Dietary preference">
              {(id) => (
                <SelectInput
                  id={id}
                  value={v.dietary}
                  onChange={(e) => set('dietary', e.target.value)}
                >
                  {DIETARY.map((d) => (
                    <option key={d} value={d} className="bg-ink-soft">
                      {d}
                    </option>
                  ))}
                </SelectInput>
              )}
            </Field>
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step>
          <dl className="divide-y divide-white/10 rounded-xl border border-white/12">
            <Row k="Ticket" val={`${tier.name} × ${v.quantity}`} />
            <Row k="Total" val={total === 0 ? 'Free' : `₹${total}`} />
            <Row k="Name" val={v.fullName} />
            <Row k="Email" val={v.email} />
            <Row k="Phone" val={v.phone} />
            {v.organisation && <Row k="Organisation" val={v.organisation} />}
            <Row k="Dietary" val={v.dietary} />
          </dl>
          <p className="mt-4 text-xs text-white/45">
            This prototype doesn’t take payment — confirming issues a mock ticket and stores the
            registration locally.
          </p>
        </Step>
      )}

      {step === 3 && receipt && (
        <Step>
          <div className="rounded-2xl border border-white/12 bg-black/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
                  {EVENT.name}
                </p>
                <p className="mt-1 text-lg font-bold">{EVENT.theme}</p>
                <p className="mt-2 text-sm text-white/70">{EVENT.date}</p>
                <p className="text-sm text-white/70">{EVENT.venue}</p>
              </div>
              <FauxQR seed={receipt.id} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/20 pt-3 text-sm">
              <span className="text-white/60">{tier.name} × {v.quantity}</span>
              <span className="font-mono text-white/90">{receipt.id}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">
            You’re in, {v.fullName.split(' ')[0]}. A confirmation would be emailed to{' '}
            <span className="text-white">{v.email}</span>. Show the code above at the door.
          </p>
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

      {step < 3 && (
        <FormNav
          canGoBack={step > 0}
          onBack={() => {
            setErrors({})
            setStep((s) => Math.max(0, s - 1))
          }}
          onNext={next}
          nextLabel={step === 2 ? 'Confirm registration' : 'Continue'}
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
      <dt className="text-white/55">{k}</dt>
      <dd className="text-right text-white/90">{val}</dd>
    </div>
  )
}

function Stepper({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (n: number) => void
}) {
  const btn =
    'h-9 w-9 rounded-lg border border-white/15 text-lg leading-none transition hover:border-white/40 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30'
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <output id={id} className="w-6 text-center text-sm font-bold">
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(6, value + 1))}
        disabled={value >= 6}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
