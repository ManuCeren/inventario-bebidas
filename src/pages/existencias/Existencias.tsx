
import { useState } from 'react'
import {
  Boxes,
  Package,
  PackageCheck,
  PackageX,
  Search,
  AlertTriangle,
} from 'lucide-react'

import { useInventario } from '../../context/InventarioContext'

type FiltroStock = 'TODOS' | 'DISPONIBLE' | 'BAJO' | 'AGOTADO'

export default function Existencias() {
  const { productos, obtenerStock } = useInventario()

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroStock>('TODOS')

  const existencias = productos.map((producto) => {
    const stock = obtenerStock(producto.id)
    const unidadesPorCaja = producto.unidadesPorCaja

    const cajasCompletas =
      unidadesPorCaja > 0
        ? Math.floor(stock / unidadesPorCaja)
        : 0

    const unidadesSueltas =
      unidadesPorCaja > 0
        ? stock % unidadesPorCaja
        : stock

    const estado: Exclude<FiltroStock, 'TODOS'> =
      stock <= 0
        ? 'AGOTADO'
        : stock <= producto.stockMinimo
          ? 'BAJO'
          : 'DISPONIBLE'

    return {
      ...producto,
      stock,
      cajasCompletas,
      unidadesSueltas,
      estado,
    }
  })

  const totalUnidades = existencias.reduce(
    (total, producto) => total + producto.stock,
    0,
  )

  const productosDisponibles = existencias.filter(
    (producto) => producto.estado === 'DISPONIBLE',
  ).length

  const productosBajoStock = existencias.filter(
    (producto) => producto.estado === 'BAJO',
  ).length

  const productosAgotados = existencias.filter(
    (producto) => producto.estado === 'AGOTADO',
  ).length

  const productosFiltrados = existencias.filter((producto) => {
    const texto = busqueda.trim().toLowerCase()

    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(texto) ||
      producto.codigo.toLowerCase().includes(texto) ||
      producto.marca.toLowerCase().includes(texto)

    const coincideEstado =
      filtro === 'TODOS' || producto.estado === filtro

    return coincideBusqueda && coincideEstado
  })

  function estiloEstado(estado: FiltroStock) {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-emerald-100 text-emerald-700'
      case 'BAJO':
        return 'bg-amber-100 text-amber-700'
      case 'AGOTADO':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  function nombreEstado(estado: FiltroStock) {
    switch (estado) {
      case 'DISPONIBLE':
        return 'Disponible'
      case 'BAJO':
        return 'Stock bajo'
      case 'AGOTADO':
        return 'Agotado'
      default:
        return 'Todos'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Existencias de inventario
        </h1>
        <p className="mt-1 text-slate-500">
          Consulta de existencias actuales del depósito de bebidas.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Unidades disponibles
            </p>
            <Boxes className="text-blue-600" size={22} />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalUnidades}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos disponibles
            </p>
            <PackageCheck className="text-emerald-600" size={22} />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {productosDisponibles}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos con stock bajo
            </p>
            <AlertTriangle className="text-amber-500" size={22} />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {productosBajoStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Productos agotados
            </p>
            <PackageX className="text-red-600" size={22} />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {productosAgotados}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Package size={21} className="text-blue-600" />
            Inventario actual
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
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

            <select
              value={filtro}
              onChange={(e) =>
                setFiltro(e.target.value as FiltroStock)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="DISPONIBLE">Disponibles</option>
              <option value="BAJO">Stock bajo</option>
              <option value="AGOTADO">Agotados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Presentación</th>
                <th className="p-4">Unidades</th>
                <th className="p-4">Cajas</th>
                <th className="p-4">Sueltas</th>
                <th className="p-4">Stock mínimo</th>
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
                    {producto.cajasCompletas}
                  </td>
                  <td className="p-4">
                    {producto.unidadesSueltas}
                  </td>
                  <td className="p-4">
                    {producto.stockMinimo}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${estiloEstado(producto.estado)}`}
                    >
                      {nombreEstado(producto.estado)}
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
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Las existencias se calculan automáticamente a partir de los
        movimientos de entrada y salida registrados.
      </p>
    </div>
  )
}
