
import { useState, type SubmitEvent } from 'react'
import {
  ArrowDownToLine,
  PackagePlus,
  Save,
  Search,
} from 'lucide-react'

import { useInventario } from '../../context/InventarioContext'
import type { Movimiento } from '../../types/Movimiento'

export default function Entradas() {
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

  const unidadesPorCaja = productoSeleccionado?.unidadesPorCaja ?? 0

  const cantidadTotal =
    cajas * unidadesPorCaja + unidadesSueltas

  const entradas = movimientos
    .filter((movimiento) => movimiento.tipo === 'ENTRADA')
    .filter((movimiento) => {
      const producto = productos.find(
        (p) => p.id === movimiento.productoId,
      )

      const texto = busqueda.toLowerCase()

      return (
        producto?.nombre.toLowerCase().includes(texto) ||
        producto?.codigo.toLowerCase().includes(texto)
      )
    })

  function guardarEntrada(evento: SubmitEvent<HTMLFormElement>) {
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

    if (!Number.isSafeInteger(cantidadTotal) || cantidadTotal <= 0) {
      setError('Debes ingresar al menos una unidad.')
      return
    }

    const movimiento: Movimiento = {
      id: crypto.randomUUID(),
      productoId: productoSeleccionado.id,
      tipo: 'ENTRADA',
      fecha: new Date().toISOString(),
      cajas,
      unidadesSueltas,
      unidadesPorCaja,
      cantidadTotal,
      observaciones: observaciones.trim(),
    }

    registrarMovimiento(movimiento)

    setMensaje(
      `Entrada registrada: ${cantidadTotal} unidades de ${productoSeleccionado.nombre}.`,
    )

    setProductoId('')
    setCajas(0)
    setUnidadesSueltas(0)
    setObservaciones('')
  }

  const entradasTotales = entradas.reduce(
    (total, entrada) => total + entrada.cantidadTotal,
    0,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Entradas de inventario
        </h1>
        <p className="mt-1 text-slate-500">
          Registro de productos recibidos en el depósito.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Entradas registradas</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {entradas.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Unidades ingresadas</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {entradasTotales}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Productos activos</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {productos.filter((p) => p.activo).length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={guardarEntrada}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <PackagePlus size={22} className="text-blue-600" />
            Registrar nueva entrada
          </h2>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Producto
            </span>

            <select
              required
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
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
                Stock actual: {obtenerStock(productoId)} unidades
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
              Total de unidades a ingresar
            </p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">
              {cantidadTotal}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {cajas} cajas × {unidadesPorCaja} + {unidadesSueltas} sueltas
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Observaciones (opcional)
            </span>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Recepción de mercadería del proveedor"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {mensaje && (
            <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700"
          >
            <Save size={19} />
            Guardar entrada
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ArrowDownToLine size={22} className="text-emerald-600" />
            Entradas registradas
          </h2>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="search"
              placeholder="Buscar entradas..."
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
                {entradas.map((entrada) => {
                  const producto = productos.find(
                    (p) => p.id === entrada.productoId,
                  )

                  return (
                    <tr
                      key={entrada.id}
                      className="border-b border-slate-100"
                    >
                      <td className="p-3">
                        {producto?.nombre ?? 'Producto no encontrado'}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600">
                        +{entrada.cantidadTotal}
                      </td>
                      <td className="p-3">
                        {new Date(entrada.fecha).toLocaleDateString('es-SV')}
                      </td>
                    </tr>
                  )
                })}

                {entradas.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-500">
                      No hay entradas registradas.
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
