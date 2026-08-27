// Central content for the hero + forms. Kept in one place so copy changes
// don't require touching component logic.

export const EVENT = {
  name: 'TEDxIGDTUW',
  wordmark: 'TEDxIGDTUW', // exact string rendered as the marquee sign (lowercase x, like the logo)
  theme: 'Beyond Barriers',
  tagline: 'A day of ideas worth spreading — reimagined for the stage.',
  date: 'Saturday, 11 October 2026',
  venue: 'IGDTUW Auditorium, Kashmere Gate, Delhi',
} as const

export type TicketTier = {
  id: string
  name: string
  price: number // INR, 0 = free
  blurb: string
  perks: string[]
}

export const TICKET_TIERS: TicketTier[] = [
  {
    id: 'student',
    name: 'Student',
    price: 299,
    blurb: 'For anyone currently enrolled in a school or university.',
    perks: ['Full-day access', 'Lunch + refreshments', 'Event kit'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 799,
    blurb: 'For working professionals, alumni and the general public.',
    perks: ['Full-day access', 'Lunch + refreshments', 'Event kit', 'Priority seating'],
  },
  {
    id: 'patron',
    name: 'Patron',
    price: 2499,
    blurb: 'Support the licence and help us keep student tickets affordable.',
    perks: [
      'Everything in Professional',
      'Front-block seating',
      'Invite to the speakers’ reception',
      'Name on the thank-you wall',
    ],
  },
]

// Speaker application — the talk must map to one of the event tracks.
export const SPEAKER_TRACKS = [
  'Technology & AI',
  'Design & Creativity',
  'Society & Identity',
  'Science & Health',
  'Entrepreneurship',
  'Personal journey / Story',
] as const

export const HEARD_FROM = [
  'Instagram',
  'LinkedIn',
  'A friend / word of mouth',
  'College noticeboard / class',
  'Past TEDxIGDTUW attendee',
  'Other',
] as const
