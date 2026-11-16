import type { CSSProperties, ReactNode } from 'react'

type PhotoPrintProps = {
  src: string
  alt: string
  ratio?: '3-4' | '4-3' | '1-1' | '16-9'
  caption?: ReactNode
  note?: ReactNode
  tilt?: 'left' | 'right' | 'none'
  className?: string
  style?: CSSProperties
  lazy?: boolean
}

export function PhotoPrint({
  src,
  alt,
  ratio = '4-3',
  caption,
  note,
  tilt = 'left',
  className,
  style,
  lazy = true,
}: PhotoPrintProps) {
  return (
    <figure
      className={[
        'photo-print-wrap',
        tilt === 'left' ? 'tilt-left' : '',
        tilt === 'right' ? 'tilt-right' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span className="tape" aria-hidden="true" />
      <div className={`photo-print ratio-${ratio}`}>
        <img src={src} alt={alt} loading={lazy ? 'lazy' : undefined} />
        {caption || note ? (
          <figcaption>
            <b>{caption}</b>
            <span>{note}</span>
          </figcaption>
        ) : null}
      </div>
    </figure>
  )
}

export function StatusStamp({ children, tone = 'primary' }: { children: ReactNode; tone?: 'primary' | 'secondary' }) {
  return <span className={`stamp stamp-${tone}`}>{children}</span>
}
