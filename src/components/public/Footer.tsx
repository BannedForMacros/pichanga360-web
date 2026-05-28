import Link from 'next/link'
import Container from '@/components/ui/Container'

const Social = ({ label }: { label: string }) => (
  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-bold uppercase tracking-wide text-white/70 transition hover:border-warning hover:text-warning">
    {label}
  </span>
)

const cols = [
  {
    title: 'Producto',
    links: [
      { label: 'Buscar canchas', href: '/buscar' },
      { label: 'Para dueños', href: '/registro-empresa' },
      { label: 'Aplicación móvil', href: '#' },
      { label: 'Planes', href: '#precios' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Nosotros', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreras', href: '#' },
      { label: 'Contacto', href: '#' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Centro de ayuda', href: '#' },
      { label: 'Términos', href: '#' },
      { label: 'Privacidad', href: '#' },
      { label: 'Estado del servicio', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full bg-dark text-white">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <span className="text-lg font-black text-primary">P</span>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Pichanga<span className="text-warning">360</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              El marketplace deportivo del Perú. Encuentra y reserva canchas de
              fútbol, vóley, básquet y más, a un clic.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a aria-label="Instagram" href="#"><Social label="IG" /></a>
              <a aria-label="Facebook" href="#"><Social label="FB" /></a>
              <a aria-label="Twitter" href="#"><Social label="TW" /></a>
              <a aria-label="Youtube" href="#"><Social label="YT" /></a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 hover:text-warning"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Pichanga360. Hecho en el Perú.</p>
          <p>RUC 20612345678 · Lima, Perú</p>
        </Container>
      </div>
    </footer>
  )
}
