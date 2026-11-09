
import { useState, type SubmitEvent } from 'react'
import {
  ArrowUpFromLine,
  PackageMinus,
  Save,
  Search,
  AlertTriangle,
} from 'lucide-react'

import { useInventario } from '../../context/InventarioContext'
import type { Movimiento } from '../../types/Movimiento'

export default function Salidas() {
  const {
    productos,
    movimientos,
    registrarMovimiento,
    obtenerStock,
  } = useInventario()

  const [productoId, setProductoId] = useState('')
  const [cajas, setCajas] = useState(0)
  const [unidadesSueltas, setUnidadesSueltas] = useState(0)
  const [observaciones, setObservaciones] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const productoSeleccionado = productos.find(
    (producto) => producto.id === productoId,
  )

  const unidadesPorCaja =
    productoSeleccionado?.unidadesPorCaja ?? 0

  const stockActual = productoSeleccionado
    ? obtenerStock(productoSeleccionado.id)
    : 0

  const cantidadTotal =
    cajas * unidadesPorCaja + unidadesSueltas

  const stockRestante = stockActual - cantidadTotal

  const stockInsuficiente =
    productoSeleccionado !== undefined &&
    cantidadTotal > stockActual

  const salidas = movimientos
    .filter((movimiento) => movimiento.tipo === 'SALIDA')
    .filter((movimiento) => {
      const producto = productos.find(
        (p) => p.id === movimiento.productoId,
      )

      const texto = busqueda.toLowerCase().trim()

      return (
        (producto?.nombre.toLowerCase().includes(texto) ?? false) ||
        (producto?.codigo.toLowerCase().includes(texto) ?? false)
      )
    })

  const totalDespachado = movimientos
    .filter((movimiento) => movimiento.tipo === 'SALIDA')
    .reduce(
      (total, movimiento) => total + movimiento.cantidadTotal,
      0,
    )

  function guardarSalida(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!productoSeleccionado || !productoSeleccionado.activo) {
      setError('Selecciona un producto activo.')
      return
    }

    if (
      !Number.isSafeInteger(cajas) ||
      !Number.isSafeInteger(unidadesSueltas) ||
      cajas < 0 ||
      unidadesSueltas < 0
    ) {
      setError('Las cantidades deben ser números enteros no negativos.')
      return
    }

    if (
      !Number.isSafeInteger(cantidadTotal) ||
      cantidadTotal <= 0
    ) {
      setError('Debes despachar al menos una unidad.')
      return
    }

    const existenciasDisponibles = obtenerStock(
      productoSeleccionado.id,
    )

    if (cantidadTotal > existenciasDisponibles) {
      setError(
        `Stock insuficiente. Disponibles: ${existenciasDisponibles} unidades. Solicitadas: ${cantidadTotal}.`,
      )
      return
    }

    const movimiento: Movimiento = {
      id: crypto.randomUUID(),
      productoId: productoSeleccionado.id,
      tipo: 'SALIDA',
      fecha: new Date().toISOString(),
      cajas,
      unidadesSueltas,
      unidadesPorCaja,
      cantidadTotal,
      observaciones: observaciones.trim(),
    }

    registrarMovimiento(movimiento)

    setMensaje(
      `Salida registrada: ${cantidadTotal} unidades de ${productoSeleccionado.nombre}.`,
    )

    setProductoId('')
    setCajas(0)
    setUnidadesSueltas(0)
    setObservaciones('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Salidas de inventario
        </h1>
        <p className="mt-1 text-slate-500">
          Registro de productos despachados desde el depósito.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Salidas registradas
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {
              movimientos.filter(
                (movimiento) => movimiento.tipo === 'SALIDA',
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Unidades despachadas
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {totalDespachado}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Unidades disponibles
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {productos.reduce(
              (total, producto) =>
                total + obtenerStock(producto.id),
              0,
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={guardarSalida}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <PackageMinus size={22} className="text-blue-600" />
            Registrar nueva salida
          </h2>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Producto
            </span>

            <select
              required
              value={productoId}
              onChange={(e) => {
                setProductoId(e.target.value)
                setError('')
                setMensaje('')
              }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3"
            >
              <option value="">Seleccionar producto...</option>

              {productos
                .filter((producto) => producto.activo)
                .map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.codigo} - {producto.nombre}
                  </option>
                ))}
            </select>
          </label>

          {productoSeleccionado && (
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              <p>
                Equivalencia: 1 caja ={' '}
                <strong>{unidadesPorCaja} unidades</strong>
              </p>
              <p className="mt-1">
                Stock disponible:{' '}
                <strong>{stockActual} unidades</strong>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Cajas completas
              </span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={cajas}
                onChange={(e) => setCajas(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Unidades sueltas
              </span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={unidadesSueltas}
                onChange={(e) =>
                  setUnidadesSueltas(Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </label>
          </div>

          <div className="rounded-lg bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">
              Total de unidades a despachar
            </p>
            <p className="mt-2 text-4xl font-bold text-orange-600">
              {cantidadTotal}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {cajas} cajas × {unidadesPorCaja} + {unidadesSueltas} sueltas
            </p>
          </div>

          {productoSeleccionado && (
            <div
              className={`rounded-lg p-4 ${
                stockInsuficiente
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <p className="flex items-center gap-2 font-medium">
                {stockInsuficiente && <AlertTriangle size={18} />}
                Stock después de la salida: {stockRestante} unidades
              </p>

              {stockInsuficiente && (
                <p className="mt-1 text-sm">
                  No hay existencias suficientes para este despacho.
                </p>
              )}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Observaciones (opcional)
            </span>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Despacho para tienda del sector"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {mensaje && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={stockInsuficiente}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Save size={19} />
            Guardar salida
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ArrowUpFromLine size={22} className="text-orange-600" />
            Salidas registradas
          </h2>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="search"
              placeholder="Buscar salidas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {salidas.map((salida) => {
                  const producto = productos.find(
                    (p) => p.id === salida.productoId,
                  )

                  return (
                    <tr
                      key={salida.id}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3">
                        {producto?.nombre ?? 'Producto no encontrado'}
                      </td>
                      <td className="p-3 font-semibold text-orange-600">
                        -{salida.cantidadTotal}
                      </td>
                      <td className="p-3">
                        {new Date(salida.fecha).toLocaleDateString('es-SV')}
                      </td>
                    </tr>
                  )
                })}

                {salidas.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-slate-500"
                    >
                      No hay salidas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
