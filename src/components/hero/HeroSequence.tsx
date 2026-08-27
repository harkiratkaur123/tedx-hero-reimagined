import { useCallback, useEffect, useRef, useState } from 'react'
import { EVENT } from '../../data/site'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import HeroCTAs from './HeroCTAs'
import MarqueeText from './MarqueeText'

type Phase = 'intro' | 'reveal' | 'hero'

type Props = {
  onGetTickets: () => void
  onApplyToSpeak: () => void
  /** skip straight to the resting hero (e.g. a modal was deep-linked open) */
  startResolved?: boolean
}

/**
 * The reveal:
 *   1. an intro clip plays — a camera turns in, its screen lights up with
 *      footage, and it pushes toward that screen
 *   2. at the end we scale into the screen and cross-fade to…
 *   3. the hero: the TEDxIGDTUW event footage (dimmed) behind a marquee
 *      bulb-sign that lights red under the cursor, plus the two CTAs.
 */
export default function HeroSequence({ onGetTickets, onApplyToSpeak, startResolved }: Props) {
  const prefersReduced = usePrefersReducedMotion()
  const skipIntro = Boolean(startResolved) || prefersReduced

  const [phase, setPhase] = useState<Phase>(skipIntro ? 'hero' : 'intro')
  const [showMarquee, setShowMarquee] = useState(skipIntro)
  const [interactive, setInteractive] = useState(skipIntro)

  const introRef = useRef<HTMLVideoElement>(null)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const timers = useRef<number[]>([])
  const revealStarted = useRef(skipIntro)

  const startReveal = useCallback(() => {
    if (revealStarted.current) return
    revealStarted.current = true
    setPhase('reveal')
    timers.current.push(
      window.setTimeout(() => setPhase('hero'), 850),
      window.setTimeout(() => setShowMarquee(true), 1050),
      window.setTimeout(() => setInteractive(true), 2100),
    )
  }, [])

  // Intro playback + the hand-off into the hero.
  useEffect(() => {
    if (skipIntro) return
    const v = introRef.current
    if (!v) return
    v.play().catch(() => {})
    const onTime = () => {
      if (v.duration && v.currentTime >= v.duration - 1.1) startReveal()
    }
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', startReveal)
    v.addEventListener('error', startReveal)
    // safety net if the clip never loads
    const safety = window.setTimeout(startReveal, 12000)
    timers.current.push(safety)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', startReveal)
      v.removeEventListener('error', startReveal)
    }
  }, [skipIntro, startReveal])

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  // Keep the hero footage playing once we're there (browsers pause hidden video).
  useEffect(() => {
    if (phase === 'intro') return
    const play = () => {
      if (!document.hidden) heroVideoRef.current?.play().catch(() => {})
    }
    play()
    document.addEventListener('visibilitychange', play)
    return () => document.removeEventListener('visibilitychange', play)
  }, [phase])

  // Skip with any key during the intro.
  useEffect(() => {
    if (revealStarted.current) return
    const onKey = () => startReveal()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startReveal])

  const heroReady = phase === 'hero'
  const introGone = phase !== 'intro'

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* ---- intro clip ---- */}
      {!skipIntro && (
        <div
          className="absolute inset-0 z-30 bg-ink transition-opacity duration-[900ms]"
          style={{ opacity: introGone ? 0 : 1, pointerEvents: introGone ? 'none' : 'auto' }}
        >
          <video
            ref={introRef}
            src="/media/intro.mp4"
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.7,0,.2,1)]"
            style={{
              transform: introGone ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: '38% 50%',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(130% 90% at 50% 50%, transparent 45%, rgba(0,0,0,0.28) 100%)',
            }}
          />
          {!revealStarted.current && (
            <button
              type="button"
              onClick={startReveal}
              className="absolute top-4 right-5 rounded-full border border-black/25 bg-white/60 px-4 py-1.5
                         text-xs tracking-widest text-black/70 uppercase backdrop-blur transition
                         hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              Skip intro
            </button>
          )}
        </div>
      )}

      {/* ---- hero background footage (dimmed) ---- */}
      <video
        ref={heroVideoRef}
        src="/media/hero-loop.mp4"
        muted
        loop
        playsInline
        preload={skipIntro ? 'auto' : 'none'}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms]"
        style={{ opacity: heroReady ? 0.5 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1200ms]"
        style={{
          opacity: heroReady ? 1 : 0,
          background:
            'radial-gradient(125% 90% at 50% 42%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.62) 58%, rgba(0,0,0,0.9) 100%)',
        }}
      />

      {/* ---- foreground: marquee + CTAs ---- */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div
          className="transition-all duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)]"
          style={{
            opacity: showMarquee ? 1 : 0,
            transform: showMarquee ? 'translateY(0)' : 'translateY(18px)',
          }}
        >
          <MarqueeText
            text={EVENT.wordmark}
            interactive={interactive}
            animateIn={showMarquee && !skipIntro}
          />
        </div>

        <p
          className="mt-4 text-center text-xs tracking-[0.42em] text-white/70 uppercase transition-opacity duration-700 sm:text-sm"
          style={{ opacity: showMarquee ? 1 : 0, transitionDelay: '250ms' }}
        >
          {EVENT.theme}
        </p>

        <HeroCTAs
          show={interactive}
          onGetTickets={onGetTickets}
          onApplyToSpeak={onApplyToSpeak}
        />
      </div>

      {/* ---- top bar ---- */}
      <div
        className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-5 py-4 transition-opacity duration-500 sm:px-8"
        style={{ opacity: interactive ? 1 : 0 }}
      >
        <span className="text-lg font-bold tracking-tight">
          TEDx<span className="text-ted">IGDTUW</span>
        </span>
        <span className="hidden text-xs tracking-[0.25em] text-white/60 uppercase sm:block">
          {EVENT.date}
        </span>
      </div>

      {/* ---- scroll hint ---- */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        aria-label="Scroll down"
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-xl text-white/50 transition-opacity duration-500 hover:text-white/80"
        style={{ opacity: interactive ? 1 : 0, pointerEvents: interactive ? 'auto' : 'none' }}
      >
        <span className="block animate-bounce" aria-hidden>
          ↓
        </span>
      </button>
    </section>
  )
}
