
import { useMemo, useState } from 'react'
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Filter,
  CalendarDays,
  Boxes,
  RotateCcw,
} from 'lucide-react'

import { useInventario } from '../../context/InventarioContext'

type FiltroTipo = 'TODOS' | 'ENTRADA' | 'SALIDA'

export default function Historial() {
  const { productos, movimientos } = useInventario()

  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState<FiltroTipo>('TODOS')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Resumen general de todos los movimientos registrados.
  const resumen = useMemo(() => {
    const entradas = movimientos.filter(
      (movimiento) => movimiento.tipo === 'ENTRADA',
    )

    const salidas = movimientos.filter(
      (movimiento) => movimiento.tipo === 'SALIDA',
    )

    const unidadesEntradas = entradas.reduce(
      (total, movimiento) => total + movimiento.cantidadTotal,
      0,
    )

    const unidadesSalidas = salidas.reduce(
      (total, movimiento) => total + movimiento.cantidadTotal,
      0,
    )

    return {
      totalMovimientos: movimientos.length,
      totalEntradas: entradas.length,
      totalSalidas: salidas.length,
      unidadesEntradas,
      unidadesSalidas,
      balance: unidadesEntradas - unidadesSalidas,
    }
  }, [movimientos])

  // Filtrar movimientos y ordenar por fecha.
  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    const inicio = fechaInicio
      ? new Date(`${fechaInicio}T00:00:00`).getTime()
      : null

    const fin = fechaFin
      ? new Date(`${fechaFin}T23:59:59.999`).getTime()
      : null

    return movimientos
      .filter((movimiento) => {
        const producto = productos.find(
          (p) => p.id === movimiento.productoId,
        )

        const coincideBusqueda =
          texto === '' ||
          (producto?.nombre.toLowerCase().includes(texto) ?? false) ||
          (producto?.codigo.toLowerCase().includes(texto) ?? false) ||
          movimiento.observaciones.toLowerCase().includes(texto)

        const coincideTipo =
          tipo === 'TODOS' || movimiento.tipo === tipo

        const fechaMovimiento = new Date(
          movimiento.fecha,
        ).getTime()

        const coincideInicio =
          inicio === null || fechaMovimiento >= inicio

        const coincideFin =
          fin === null || fechaMovimiento <= fin

        return (
          coincideBusqueda &&
          coincideTipo &&
          coincideInicio &&
          coincideFin
        )
      })
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() -
          new Date(a.fecha).getTime(),
      )
  }, [movimientos, productos, busqueda, tipo, fechaInicio, fechaFin])

  function limpiarFiltros() {
    setBusqueda('')
    setTipo('TODOS')
    setFechaInicio('')
    setFechaFin('')
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString('es-SV', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Historial de movimientos
        </h1>
        <p className="mt-1 text-slate-500">
          Consulta y seguimiento de entradas y salidas del depósito.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total de movimientos
            </p>
            <History size={22} className="text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {resumen.totalMovimientos}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Entradas registradas
            </p>
            <ArrowDownToLine
              size={22}
              className="text-emerald-600"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {resumen.totalEntradas}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            +{resumen.unidadesEntradas} unidades
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Salidas registradas
            </p>
            <ArrowUpFromLine
              size={22}
              className="text-orange-600"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {resumen.totalSalidas}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            -{resumen.unidadesSalidas} unidades
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Balance de unidades
            </p>
            <Boxes size={22} className="text-indigo-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {resumen.balance}
          </p>
        </div>
      </div>

      {/* Historial y filtros */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <History size={21} className="text-blue-600" />
            Registro de movimientos
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="search"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent py-2 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
              <Filter size={18} className="text-slate-400" />
              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as FiltroTipo)
                }
                className="w-full bg-white py-2 outline-none"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="ENTRADA">Entradas</option>
                <option value="SALIDA">Salidas</option>
              </select>
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
              <CalendarDays size={18} className="text-slate-400" />
              <input
                type="date"
                aria-label="Fecha inicial"
                value={fechaInicio}
                max={fechaFin || undefined}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
              <CalendarDays size={18} className="text-slate-400" />
              <input
                type="date"
                aria-label="Fecha final"
                value={fechaFin}
                min={fechaInicio || undefined}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={17} />
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cajas</th>
                <th className="p-4">Sueltas</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Observaciones</th>
              </tr>
            </thead>

            <tbody>
              {movimientosFiltrados.map((movimiento) => {
                const producto = productos.find(
                  (p) => p.id === movimiento.productoId,
                )

                const esEntrada = movimiento.tipo === 'ENTRADA'

                return (
                  <tr
                    key={movimiento.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap p-4 text-slate-600">
                      {formatearFecha(movimiento.fecha)}
                    </td>

                    <td className="p-4 font-medium">
                      {producto?.codigo ?? 'N/D'}
                    </td>

                    <td className="p-4">
                      {producto?.nombre ?? 'Producto no encontrado'}
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

                    <td className="p-4">
                      {movimiento.cajas}
                    </td>

                    <td className="p-4">
                      {movimiento.unidadesSueltas}
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

                    <td className="max-w-xs p-4 text-slate-600">
                      {movimiento.observaciones || 'Sin observaciones'}
                    </td>
                  </tr>
                )
              })}

              {movimientosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-500"
                  >
                    No se encontraron movimientos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-500">
          Mostrando {movimientosFiltrados.length} de{' '}
          {movimientos.length} movimientos registrados.
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Este historial es de consulta. Las entradas y salidas se
        registran desde sus respectivos módulos.
      </p>
    </div>
  )
}
