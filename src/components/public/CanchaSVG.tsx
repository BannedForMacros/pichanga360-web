import type { DeporteCodigo, SuperficieCodigo } from '@/types'

interface Props {
  deporte: DeporteCodigo
  superficie: SuperficieCodigo
  className?: string
}

const palette: Record<string, { bg: string; line: string; accent: string }> = {
  FUTBOL_GRASS: { bg: '#1F8A4F', line: '#FFFFFF', accent: '#3CB371' },
  FUTBOL_SINTETICO: { bg: '#2A6F97', line: '#FFFFFF', accent: '#468FAF' },
  FUTBOL_CEMENTO: { bg: '#7A8794', line: '#FFFFFF', accent: '#9AA6B2' },
  VOLEY_GRASS: { bg: '#9C7A4F', line: '#FFFFFF', accent: '#B89067' },
  VOLEY_CEMENTO: { bg: '#A47148', line: '#FFFFFF', accent: '#C28B5C' },
  BASKET_CEMENTO: { bg: '#D8A057', line: '#FFFFFF', accent: '#E8B574' },
  BASKET_MADERA: { bg: '#B8773C', line: '#FFFFFF', accent: '#D69056' },
  TENIS_CEMENTO: { bg: '#27726F', line: '#FFFFFF', accent: '#3F8C89' },
  PADEL_SINTETICO: { bg: '#1F8A4F', line: '#FFFFFF', accent: '#3CB371' },
}

function pickColors(deporte: DeporteCodigo, superficie: SuperficieCodigo) {
  const key = `${deporte}_${superficie}`
  if (palette[key]) return palette[key]
  if (deporte === 'FUTBOL') return palette.FUTBOL_GRASS
  if (deporte === 'VOLEY') return palette.VOLEY_CEMENTO
  if (deporte === 'BASKET') return palette.BASKET_CEMENTO
  if (deporte === 'TENIS') return palette.TENIS_CEMENTO
  if (deporte === 'PADEL') return palette.PADEL_SINTETICO
  return palette.FUTBOL_GRASS
}

export function CanchaSVG({ deporte, superficie, className }: Props) {
  const c = pickColors(deporte, superficie)

  return (
    <svg
      viewBox="0 0 400 220"
      className={className ?? 'h-44 w-full'}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`g-${deporte}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={c.bg} />
          <stop offset="100%" stopColor={c.accent} />
        </linearGradient>
        <pattern
          id={`stripes-${deporte}`}
          width="40"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          <rect width="20" height="220" fill="#000" opacity="0.06" />
        </pattern>
      </defs>
      <rect width="400" height="220" fill={`url(#g-${deporte})`} />
      {deporte === 'FUTBOL' && (
        <>
          <rect width="400" height="220" fill={`url(#stripes-${deporte})`} />
          <rect
            x="20"
            y="20"
            width="360"
            height="180"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
            rx="2"
          />
          <line
            x1="200"
            y1="20"
            x2="200"
            y2="200"
            stroke={c.line}
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="110"
            r="28"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <rect
            x="20"
            y="70"
            width="48"
            height="80"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <rect
            x="332"
            y="70"
            width="48"
            height="80"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
        </>
      )}
      {deporte === 'VOLEY' && (
        <>
          <rect
            x="40"
            y="40"
            width="320"
            height="140"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <line
            x1="200"
            y1="40"
            x2="200"
            y2="180"
            stroke={c.line}
            strokeWidth="3"
          />
          <line
            x1="120"
            y1="40"
            x2="120"
            y2="180"
            stroke={c.line}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1="280"
            y1="40"
            x2="280"
            y2="180"
            stroke={c.line}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </>
      )}
      {deporte === 'BASKET' && (
        <>
          <rect
            x="30"
            y="30"
            width="340"
            height="160"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <line
            x1="200"
            y1="30"
            x2="200"
            y2="190"
            stroke={c.line}
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="110"
            r="32"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <path
            d="M30 60 Q90 110 30 160"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <path
            d="M370 60 Q310 110 370 160"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
        </>
      )}
      {deporte === 'TENIS' && (
        <>
          <rect
            x="40"
            y="30"
            width="320"
            height="160"
            fill="none"
            stroke={c.line}
            strokeWidth="2"
          />
          <line
            x1="200"
            y1="30"
            x2="200"
            y2="190"
            stroke={c.line}
            strokeWidth="3"
          />
          <line
            x1="40"
            y1="110"
            x2="360"
            y2="110"
            stroke={c.line}
            strokeWidth="1.5"
          />
          <line
            x1="100"
            y1="30"
            x2="100"
            y2="190"
            stroke={c.line}
            strokeWidth="1.5"
          />
          <line
            x1="300"
            y1="30"
            x2="300"
            y2="190"
            stroke={c.line}
            strokeWidth="1.5"
          />
        </>
      )}
      {deporte === 'PADEL' && (
        <>
          <rect
            x="60"
            y="40"
            width="280"
            height="140"
            fill="none"
            stroke={c.line}
            strokeWidth="3"
          />
          <line
            x1="200"
            y1="40"
            x2="200"
            y2="180"
            stroke={c.line}
            strokeWidth="2"
          />
          <line
            x1="60"
            y1="110"
            x2="340"
            y2="110"
            stroke={c.line}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </>
      )}
      {deporte === 'OTRO' && (
        <>
          <circle cx="200" cy="110" r="50" fill="none" stroke={c.line} strokeWidth="2" />
        </>
      )}
    </svg>
  )
}
