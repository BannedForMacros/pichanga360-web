import Link from 'next/link'

const Social = ({ label }: { label: string }) => (
  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-500 transition hover:border-primary hover:text-primary">
    {label}
  </span>
)

const cols = [
  {
    title: 'Producto',
    links: [
      { label: 'Buscar canchas', href: '/buscar' },
      { label: 'Para dueños', href: '/registro' },
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
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-2 ring-primary">
              <span className="text-lg font-black text-primary">P</span>
            </span>
            <span className="text-lg font-extrabold tracking-tight text-primary">
              Pichanga<span className="text-warning">360</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-gray-600">
            El marketplace deportivo del Perú. Encuentra y reserva canchas de fútbol,
            vóley, básquet y más, a un clic.
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
            <h4 className="text-sm font-semibold uppercase tracking-wide text-dark">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-600 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} Pichanga360. Hecho en el Perú.</p>
          <p>RUC 20612345678 · Lima, Perú</p>
        </div>
      </div>
    </footer>
  )
}
