
import {
  Package,
  Boxes,
  ArrowDownToLine,
  TriangleAlert,
} from 'lucide-react'

const indicadores = [
  {
    titulo: 'Productos registrados',
    valor: '12',
    icono: Package,
    color: 'text-blue-600',
  },
  {
    titulo: 'Unidades disponibles',
    valor: '248',
    icono: Boxes,
    color: 'text-emerald-600',
  },
  {
    titulo: 'Entradas registradas',
    valor: '8',
    icono: ArrowDownToLine,
    color: 'text-violet-600',
  },
  {
    titulo: 'Alertas de inventario',
    valor: '3',
    icono: TriangleAlert,
    color: 'text-amber-600',
  },
]

const movimientos = [
  {
    producto: 'Coca-Cola 355 ml lata',
    tipo: 'Entrada',
    cantidad: '+72',
    fecha: '08/11/2026',
  },
  {
    producto: 'Coca-Cola 355 ml lata',
    tipo: 'Salida',
    cantidad: '-10',
    fecha: '08/11/2026',
  },
  {
    producto: 'Coca-Cola 2 L botella',
    tipo: 'Entrada',
    cantidad: '+24',
    fecha: '07/11/2026',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Panel de control
        </h1>
        <p className="mt-1 text-slate-500">
          Resumen general del inventario del depósito.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map((item) => {
          const Icon = item.icono

          return (
            <div
              key={item.titulo}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {item.titulo}
                </p>
                <Icon size={24} className={item.color} />
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-800">
                {item.valor}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Movimientos recientes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((movimiento, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 text-sm"
                >
                  <td className="p-4">{movimiento.producto}</td>
                  <td className="p-4">{movimiento.tipo}</td>
                  <td className="p-4 font-medium">
                    {movimiento.cantidad}
                  </td>
                  <td className="p-4">{movimiento.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Prototipo académico con datos ficticios.
      </p>
    </div>
  )
}
