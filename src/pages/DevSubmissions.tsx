import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clearSubmissions, getSubmissions, type Submission } from '../lib/submissions'

/**
 * Not linked from the site. A dev-only window onto what the two forms captured,
 * standing in for the passcode-gated review surface that the brief scopes out
 * as separate, future work.
 */
export default function DevSubmissions() {
  const [items, setItems] = useState<Submission[]>(() => getSubmissions())
  const [filter, setFilter] = useState<'all' | 'ticket' | 'speaker'>('all')

  const shown = items.filter((i) => filter === 'all' || i.kind === filter)

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Submissions (dev)</h1>
          <p className="text-sm text-white/50">
            localStorage · {items.length} total ·{' '}
            <Link to="/" className="text-ted-bright underline">
              back to site
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'ticket', 'speaker'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                filter === f ? 'bg-ted text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => {
              if (confirm('Clear all stored submissions?')) {
                clearSubmissions()
                setItems([])
              }
            }}
            className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/20"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {shown.length === 0 && (
          <p className="rounded-lg border border-white/10 p-6 text-center text-sm text-white/40">
            Nothing yet — submit a ticket or speaker application on the site.
          </p>
        )}
        {shown.map((s) => (
          <details
            key={s.id}
            className="rounded-lg border border-white/10 bg-ink-soft p-4 text-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span
                  className={`mr-2 rounded px-1.5 py-0.5 text-[10px] tracking-wide uppercase ${
                    s.kind === 'ticket' ? 'bg-ted/20 text-ted-bright' : 'bg-white/15 text-white'
                  }`}
                >
                  {s.kind}
                </span>
                <span className="font-mono text-white/80">{s.id}</span>
              </span>
              <time className="text-xs text-white/40">
                {new Date(s.createdAt).toLocaleString()}
              </time>
            </summary>
            <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-xs text-white/70">
              {JSON.stringify(s.data, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </main>
  )
}
