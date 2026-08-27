import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

/**
 * Lightweight dialog: CSS-transition enter (no exit animation, so it can't get
 * stuck half-faded), Esc to close, backdrop click, body scroll lock, focus in.
 */
export default function Modal({ open, onClose, title, subtitle, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!open) return
    // setTimeout (not rAF — rAF is paused in background tabs) to flip into the
    // entered state one tick after mount so the CSS transition runs.
    const t = window.setTimeout(() => setEntered(true), 20)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      clearTimeout(t)
      setEntered(false)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 transition-opacity duration-200 sm:p-8"
      style={{ opacity: entered ? 1 : 0 }}
    >
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-ink-soft
                   p-6 shadow-2xl outline-none transition-transform duration-200 ease-[cubic-bezier(.22,1,.36,1)] sm:p-8"
        style={{ transform: entered ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)' }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
