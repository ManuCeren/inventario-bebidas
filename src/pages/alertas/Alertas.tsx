
import { useState } from 'react'
import {
  AlertTriangle,
  PackageX,
  PackageCheck,
  Search,
  Boxes,
  RefreshCw,
} from 'lucide-react'

import { useInventario } from '../../context/InventarioContext'

type FiltroAlerta = 'TODOS' | 'BAJO' | 'AGOTADO'

export default function Alertas() {
  const { productos, obtenerStock } = useInventario()

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroAlerta>('TODOS')

  const existencias = productos
    .filter((producto) => producto.activo)
    .map((producto) => {
      const stock = obtenerStock(producto.id)

      const estado: 'DISPONIBLE' | 'BAJO' | 'AGOTADO' =
        stock <= 0
          ? 'AGOTADO'
          : stock <= producto.stockMinimo
            ? 'BAJO'
            : 'DISPONIBLE'

      const unidadesFaltantes = Math.max(
        0,
        producto.stockMinimo - stock,
      )

      const cajasSugeridas =
        producto.unidadesPorCaja > 0
          ? Math.ceil(
              unidadesFaltantes / producto.unidadesPorCaja,
            )
          : 0

      return {
        ...producto,
        stock,
        estado,
        unidadesFaltantes,
        cajasSugeridas,
      }
    })

  const productosAgotados = existencias.filter(
    (producto) => producto.estado === 'AGOTADO',
  )

  const productosBajoStock = existencias.filter(
    (producto) => producto.estado === 'BAJO',
  )

  const productosDisponibles = existencias.filter(
    (producto) => producto.estado === 'DISPONIBLE',
  )

  const totalAlertas =
    productosAgotados.length + productosBajoStock.length

  const productosFiltrados = existencias
    .filter((producto) => producto.estado !== 'DISPONIBLE')
    .filter((producto) => {
      const texto = busqueda.trim().toLowerCase()

      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(texto) ||
        producto.codigo.toLowerCase().includes(texto) ||
        producto.marca.toLowerCase().includes(texto)

      const coincideEstado =
        filtro === 'TODOS' || producto.estado === filtro

      return coincideBusqueda && coincideEstado
    })
    .sort((a, b) => {
      if (a.estado === b.estado) {
        return a.nombre.localeCompare(b.nombre)
      }

      return a.estado === 'AGOTADO' ? -1 : 1
    })

  function limpiarFiltros() {
    setBusqueda('')
    setFiltro('TODOS')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Alertas de inventario
        </h1>
        <p className="mt-1 text-slate-500">
          Monitoreo de productos agotados y con existencias
          inferiores o iguales al stock mínimo.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Alertas activas
            </p>
            <AlertTriangle
              className="text-blue-600"
              size={22}
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalAlertas}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos agotados
            </p>
            <PackageX
              className="text-red-600"
              size={22}
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {productosAgotados.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos con stock bajo
            </p>
            <AlertTriangle
              className="text-amber-500"
              size={22}
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {productosBajoStock.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos disponibles
            </p>
            <PackageCheck
              className="text-emerald-600"
              size={22}
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {productosDisponibles.length}
          </p>
        </div>
      </div>

      {/* Mensaje informativo */}
      {totalAlertas > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-amber-600"
            size={22}
          />
          <div>
            <p className="font-semibold text-amber-800">
              Atención: existen productos que requieren reposición
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Actualmente hay {productosAgotados.length} productos
              agotados y {productosBajoStock.length} productos
              con stock bajo. Se recomienda revisar las
              existencias y programar el abastecimiento.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <PackageCheck
            className="text-emerald-600"
            size={22}
          />
          <p className="text-sm font-medium text-emerald-700">
            No existen alertas activas. Todos los productos
            activos cuentan con existencias superiores
            al stock mínimo.
          </p>
        </div>
      )}

      {/* Tabla de alertas */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Boxes
              size={21}
              className="text-blue-600"
            />
            Productos que requieren atención
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
              <Search
                size={18}
                className="text-slate-400"
              />
              <input
                type="search"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent py-2 outline-none"
              />
            </div>

            <select
              value={filtro}
              onChange={(e) =>
                setFiltro(e.target.value as FiltroAlerta)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="TODOS">Todas las alertas</option>
              <option value="AGOTADO">Agotados</option>
              <option value="BAJO">Stock bajo</option>
            </select>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={17} />
              Limpiar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Presentación</th>
                <th className="p-4">Existencias</th>
                <th className="p-4">Stock mínimo</th>
                <th className="p-4">Unidades faltantes</th>
                <th className="p-4">Cajas sugeridas</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>

            <tbody>
              {productosFiltrados.map((producto) => (
                <tr
                  key={producto.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">
                    {producto.codigo}
                  </td>

                  <td className="p-4">
                    {producto.nombre}
                  </td>

                  <td className="p-4">
                    {producto.volumen} · {producto.envase}
                  </td>

                  <td className="p-4 font-semibold">
                    {producto.stock}
                  </td>

                  <td className="p-4">
                    {producto.stockMinimo}
                  </td>

                  <td className="p-4 font-semibold text-orange-600">
                    {producto.unidadesFaltantes}
                  </td>

                  <td className="p-4">
                    {producto.cajasSugeridas}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        producto.estado === 'AGOTADO'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {producto.estado === 'AGOTADO'
                        ? 'Agotado'
                        : 'Stock bajo'}
                    </span>
                  </td>
                </tr>
              ))}

              {productosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-slate-500"
                  >
                    No se encontraron alertas con los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          Mostrando {productosFiltrados.length} de {totalAlertas}{' '}
          alertas activas.
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Las alertas se generan automáticamente a partir de las
        existencias actuales y el stock mínimo configurado
        para cada producto. Las cajas sugeridas representan
        cajas completas necesarias para alcanzar al menos
        el mínimo establecido.
      </p>
    </div>
  )
}
