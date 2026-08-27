type Props = {
  show: boolean
  onGetTickets: () => void
  onApplyToSpeak: () => void
}

/**
 * The two doors in — replacing the single off-site Google Form link with two
 * clearly separate, on-site calls-to-action.
 */
export default function HeroCTAs({ show, onGetTickets, onApplyToSpeak }: Props) {
  return (
    <div
      className="mt-10 flex flex-col items-center gap-3 transition-all duration-500 sm:flex-row sm:gap-4"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(22px)',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <button
        type="button"
        onClick={onGetTickets}
        className="min-w-56 rounded-full bg-ted px-8 py-3.5 text-base font-bold tracking-wide
                   text-white transition hover:bg-ted-bright hover:shadow-[0_0_30px_rgba(255,31,61,0.55)]
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Get Tickets
      </button>
      <button
        type="button"
        onClick={onApplyToSpeak}
        className="min-w-56 rounded-full border border-white/70 px-8 py-3.5 text-base font-bold
                   tracking-wide text-white transition hover:border-white hover:bg-white/10
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Apply to Speak
      </button>
    </div>
  )
}
