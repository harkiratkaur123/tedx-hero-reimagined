import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

const baseInput =
  'w-full rounded-lg border bg-black/40 px-3.5 py-2.5 text-[15px] text-white placeholder-white/35 ' +
  'transition focus:outline-none focus:ring-2 focus:ring-ted/70'

function ring(error?: string) {
  return error ? 'border-ted/80' : 'border-white/15 focus:border-white/30'
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
        {required && <span className="ml-0.5 text-ted">*</span>}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs text-ted-bright">{error}</p>
      ) : hint ? (
        <p className="text-xs text-white/45">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      aria-invalid={!!error}
      className={`${baseInput} ${ring(error)}`}
    />
  )
}

export function TextArea({
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      {...props}
      aria-invalid={!!error}
      className={`${baseInput} ${ring(error)} min-h-24 resize-y`}
    />
  )
}

export function SelectInput({
  error,
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { error?: string; children: ReactNode }) {
  return (
    <select
      {...(props as object)}
      aria-invalid={!!error}
      className={`${baseInput} ${ring(error)} appearance-none`}
    >
      {children}
    </select>
  )
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current ? 'w-6 bg-ted' : i < current ? 'w-1.5 bg-ted/60' : 'w-1.5 bg-white/20'
          }`}
        />
      ))}
    </div>
  )
}

export function FormNav({
  onBack,
  onNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  canGoBack,
  nextDisabled,
}: {
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  backLabel?: string
  canGoBack: boolean
  nextDisabled?: boolean
}) {
  return (
    <div className="mt-7 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white
                   disabled:pointer-events-none disabled:opacity-0
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        ← {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-full bg-ted px-7 py-2.5 text-sm font-bold text-white transition
                   hover:bg-ted-bright disabled:cursor-not-allowed disabled:opacity-40
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {nextLabel}
      </button>
    </div>
  )
}
