
import {
  Package,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  History,
  Plus,
  ClipboardList,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { useInventario } from '../../context/InventarioContext'

export default function Dashboard() {
  const { productos, movimientos, obtenerStock } = useInventario()

  // Productos registrados
  const totalProductos = productos.length

  // Unidades disponibles en inventario
  const unidadesDisponibles = productos.reduce(
    (total, producto) =>
      total + Math.max(0, obtenerStock(producto.id)),
    0,
  )

  // Movimientos registrados
  const entradas = movimientos.filter(
    (movimiento) => movimiento.tipo === 'ENTRADA',
  )

  const salidas = movimientos.filter(
    (movimiento) => movimiento.tipo === 'SALIDA',
  )

  // Alertas de inventario
  const alertas = productos.filter((producto) => {
    if (!producto.activo) return false

    const stock = obtenerStock(producto.id)

    return stock <= producto.stockMinimo
  })

  const agotados = alertas.filter(
    (producto) => obtenerStock(producto.id) <= 0,
  ).length

  const stockBajo = alertas.length - agotados

  // Últimos cinco movimientos
  const movimientosRecientes = [...movimientos]
    .sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime(),
    )
    .slice(0, 5)

  function obtenerNombreProducto(productoId: string) {
    return (
      productos.find((producto) => producto.id === productoId)
        ?.nombre ?? 'Producto no encontrado'
    )
  }

  function formatearFecha(fecha: string) {
    const fechaConvertida = new Date(fecha)

    if (Number.isNaN(fechaConvertida.getTime())) {
      return fecha
    }

    return fechaConvertida.toLocaleString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const tarjetas = [
    {
      titulo: 'Productos registrados',
      valor: totalProductos,
      icono: Package,
      color: 'text-blue-600',
    },
    {
      titulo: 'Unidades disponibles',
      valor: unidadesDisponibles,
      icono: Boxes,
      color: 'text-emerald-600',
    },
    {
      titulo: 'Entradas registradas',
      valor: entradas.length,
      icono: ArrowDownToLine,
      color: 'text-violet-600',
    },
    {
      titulo: 'Salidas registradas',
      valor: salidas.length,
      icono: ArrowUpFromLine,
      color: 'text-orange-600',
    },
    {
      titulo: 'Alertas activas',
      valor: alertas.length,
      icono: AlertTriangle,
      color: 'text-amber-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Panel de control
        </h1>
        <p className="mt-1 text-slate-500">
          Resumen general del inventario del depósito.
        </p>
      </div>

      {/* Tarjetas dinámicas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono

          return (
            <div
              key={tarjeta.titulo}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500">
                  {tarjeta.titulo}
                </p>

                <Icono
                  size={22}
                  className={tarjeta.color}
                />
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-800">
                {tarjeta.valor}
              </p>
            </div>
          )
        })}
      </div>

      {/* Resumen de alertas */}
      {alertas.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={24}
              className="shrink-0 text-amber-600"
            />

            <div>
              <h2 className="font-semibold text-amber-900">
                Atención: productos que requieren reposición
              </h2>

              <p className="mt-1 text-sm text-amber-800">
                {agotados} productos agotados y {stockBajo}
                {' '}productos con stock bajo.
              </p>
            </div>
          </div>

          <Link
            to="/alertas"
            className="rounded-lg bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700"
          >
            Ver alertas
          </Link>
        </div>
      )}

      {/* Movimientos recientes */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <History size={21} className="text-blue-600" />
            Movimientos recientes
          </h2>

          <Link
            to="/historial"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver historial
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {movimientosRecientes.map((movimiento) => {
                const esEntrada =
                  movimiento.tipo === 'ENTRADA'

                return (
                  <tr
                    key={movimiento.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4">
                      {obtenerNombreProducto(
                        movimiento.productoId,
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          esEntrada
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {esEntrada ? 'Entrada' : 'Salida'}
                      </span>
                    </td>

                    <td
                      className={`p-4 font-semibold ${
                        esEntrada
                          ? 'text-emerald-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {esEntrada ? '+' : '-'}
                      {movimiento.cantidadTotal}
                    </td>

                    <td className="p-4 text-slate-600">
                      {formatearFecha(movimiento.fecha)}
                    </td>
                  </tr>
                )
              })}

              {movimientosRecientes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-slate-500"
                  >
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Accesos rápidos
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/productos"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={19} />
            Productos
          </Link>

          <Link
            to="/entradas"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
          >
            <ArrowDownToLine size={19} />
            Nueva entrada
          </Link>

          <Link
            to="/salidas"
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-medium text-white hover:bg-orange-700"
          >
            <ArrowUpFromLine size={19} />
            Nueva salida
          </Link>

          <Link
            to="/existencias"
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-3 font-medium text-white hover:bg-slate-800"
          >
            <ClipboardList size={19} />
            Ver existencias
          </Link>
        </div>
      </section>

      <p className="text-sm text-slate-500">
        Los indicadores se calculan automáticamente a partir
        de los productos y movimientos registrados.
      </p>
    </div>
  )
}
