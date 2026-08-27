import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeroSequence from '../components/hero/HeroSequence'
import SiteBelow from '../components/SiteBelow'
import Modal from '../components/Modal'
import GetTicketsForm from '../components/forms/GetTicketsForm'
import ApplyToSpeakForm from '../components/forms/ApplyToSpeakForm'

// The two CTAs open as modals but are also linkable / back-button friendly via
// ?modal=tickets and ?modal=speak.
type ModalName = 'tickets' | 'speak' | null

export default function Home() {
  const [params, setParams] = useSearchParams()
  const modal = (params.get('modal') as ModalName) ?? null
  // If the page loads with a modal already open (shared link), don't make the
  // visitor sit through the intro behind it.
  const deepLinked = useRef(modal !== null).current

  const open = useCallback(
    (name: Exclude<ModalName, null>) => {
      setParams((p) => {
        p.set('modal', name)
        return p
      })
    },
    [setParams],
  )

  const close = useCallback(() => {
    setParams(
      (p) => {
        p.delete('modal')
        return p
      },
      { replace: true },
    )
  }, [setParams])

  const openTickets = useCallback(() => open('tickets'), [open])
  const openSpeak = useCallback(() => open('speak'), [open])

  return (
    <main>
      <HeroSequence
        onGetTickets={openTickets}
        onApplyToSpeak={openSpeak}
        startResolved={deepLinked}
      />
      <SiteBelow onGetTickets={openTickets} onApplyToSpeak={openSpeak} />

      <Modal
        open={modal === 'tickets'}
        onClose={close}
        title="Get Tickets"
        subtitle="Register to attend — no redirect, no Google Form."
      >
        <GetTicketsForm onDone={close} />
      </Modal>

      <Modal
        open={modal === 'speak'}
        onClose={close}
        title="Apply to Speak"
        subtitle="A separate application for prospective speakers."
      >
        <ApplyToSpeakForm onDone={close} />
      </Modal>
    </main>
  )
}
