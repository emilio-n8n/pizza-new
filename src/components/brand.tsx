import { Link } from '@tanstack/react-router'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M5.5 9.5A2.5 2.5 0 0 1 8 7h16a2.5 2.5 0 0 1 2.5 2.5v3.2a3.3 3.3 0 0 0 0 6.6v3.2A2.5 2.5 0 0 1 24 25H8a2.5 2.5 0 0 1-2.5-2.5v-3.2a3.3 3.3 0 0 0 0-6.6V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M13 12.5v1.4M13 16v1.4M13 19.5v1.4M18.5 13.5v1M18.5 16.5v1M18.5 19.5v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Brand({ withTagline = true }: { withTagline?: boolean }) {
  return (
    <Link className="brand" to="/" aria-label="PizzaVoice, accueil">
      <BrandMark className="brand-mark" />
      <span>
        <span className="brand-word">PizzaVoice</span>
        {withTagline ? (
          <span className="brand-sub">Le standard des pizzerias</span>
        ) : null}
      </span>
    </Link>
  )
}
