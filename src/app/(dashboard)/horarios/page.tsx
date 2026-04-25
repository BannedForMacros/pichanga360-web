import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const dias = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

const horariosBase = [
  { dia: 'Lunes', apertura: '07:00', cierre: '23:00', tarifa: 'Normal' },
  { dia: 'Martes', apertura: '07:00', cierre: '23:00', tarifa: 'Normal' },
  { dia: 'Miércoles', apertura: '07:00', cierre: '23:00', tarifa: 'Normal' },
  { dia: 'Jueves', apertura: '07:00', cierre: '23:00', tarifa: 'Normal' },
  { dia: 'Viernes', apertura: '07:00', cierre: '00:00', tarifa: 'Hora punta' },
  { dia: 'Sábado', apertura: '07:00', cierre: '00:00', tarifa: 'Fin de semana' },
  { dia: 'Domingo', apertura: '08:00', cierre: '22:00', tarifa: 'Fin de semana' },
]

export default function HorariosPage() {
  return (
    <>
      <Header
        title="Horarios"
        breadcrumb={[{ label: 'Operación' }, { label: 'Horarios' }]}
        onNew={() => {}}
        newLabel="+ Nuevo bloque"
      />
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-dark">
              Horario operativo · Sport Center San Isidro
            </h3>
            <p className="text-xs text-gray-500">
              Define las horas de apertura y cierre por día.
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Día</th>
                <th className="px-5 py-3">Apertura</th>
                <th className="px-5 py-3">Cierre</th>
                <th className="px-5 py-3">Tarifa</th>
              </tr>
            </thead>
            <tbody>
              {horariosBase.map((h) => (
                <tr key={h.dia} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-dark">{h.dia}</td>
                  <td className="px-5 py-3 text-gray-700">{h.apertura}</td>
                  <td className="px-5 py-3 text-gray-700">{h.cierre}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        h.tarifa === 'Normal'
                          ? 'neutral'
                          : h.tarifa === 'Hora punta'
                            ? 'warning'
                            : 'primary'
                      }
                    >
                      {h.tarifa}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-dark">Bloques rápidos</h3>
          <p className="mt-1 text-xs text-gray-500">
            Aplicar tarifa en lote a varios días.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {dias.map((d) => (
              <li
                key={d}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
              >
                <span>{d}</span>
                <button className="text-xs font-semibold text-primary hover:text-primary-700">
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
