import { EVENT } from '../data/site'

/**
 * A thin slice of "the rest of the homepage" so the hero reads as the top of a
 * real site rather than a standalone splash. Not part of the feature scope —
 * deliberately minimal.
 */
export default function SiteBelow({
  onGetTickets,
  onApplyToSpeak,
}: {
  onGetTickets: () => void
  onApplyToSpeak: () => void
}) {
  return (
    <section className="border-t border-white/10 bg-ink px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.35em] text-ted uppercase">This year’s theme</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{EVENT.theme}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">{EVENT.tagline}</p>
        <p className="mt-6 text-sm text-white/45">
          {EVENT.date} · {EVENT.venue}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onGetTickets}
            className="rounded-full bg-ted px-7 py-3 text-sm font-bold transition hover:bg-ted-bright
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get Tickets
          </button>
          <button
            type="button"
            onClick={onApplyToSpeak}
            className="rounded-full border border-white/40 px-7 py-3 text-sm font-bold transition
                       hover:border-white hover:bg-white/10
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Apply to Speak
          </button>
        </div>

        <p className="mt-16 text-xs text-white/30">
          Prototype · TEDxIGDTUW Web Development assessment · This independent TEDx event is
          operated under licence from TED.
        </p>
      </div>
    </section>
  )
}
