import { useState, type SubmitEvent } from 'react'

import {

  Plus,

  Search,

  Pencil,

  Package,

  X,

  Save,

} from 'lucide-react'

import type { Producto } from '../../types/Producto'

import { useInventario } from '../../context/InventarioContext'

type FormularioProducto = Omit<Producto, 'id'>

const formularioVacio: FormularioProducto = {

  codigo: '',

  nombre: '',

  marca: '',

  volumen: '',

  envase: 'Botella plástica',

  unidadesPorCaja: 1,

  stockMinimo: 0,

  activo: true,

}

export default function Productos() {

  const { productos, guardarProducto } = useInventario()

  const [busqueda, setBusqueda] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)

  const [productoEditando, setProductoEditando] = useState<string | null>(null)

  const [formulario, setFormulario] =

    useState<FormularioProducto>({ ...formularioVacio })

  const [error, setError] = useState('')

  const productosFiltrados = productos.filter((producto) => {

    const texto = busqueda.toLowerCase().trim()

    return [

      producto.codigo,

      producto.nombre,

      producto.marca,

    ].some((campo) => campo.toLowerCase().includes(texto))

  })

  function abrirNuevo() {

    setFormulario({ ...formularioVacio })

    setProductoEditando(null)

    setError('')

    setModalAbierto(true)

  }

  function abrirEditar(producto: Producto) {

    setFormulario({

      codigo: producto.codigo,

      nombre: producto.nombre,

      marca: producto.marca,

      volumen: producto.volumen,

      envase: producto.envase,

      unidadesPorCaja: producto.unidadesPorCaja,

      stockMinimo: producto.stockMinimo,

      activo: producto.activo,

    })

    setProductoEditando(producto.id)

    setError('')

    setModalAbierto(true)

  }

  function guardarFormulario(evento: SubmitEvent<HTMLFormElement>) {

    evento.preventDefault()

    setError('')

    const codigo = formulario.codigo.trim().toUpperCase()

    const nombre = formulario.nombre.trim()

    const marca = formulario.marca.trim()

    const volumen = formulario.volumen.trim()

    const envase = formulario.envase.trim()

    if (!codigo || !nombre || !marca || !volumen || !envase) {

      setError('Todos los campos obligatorios deben completarse.')

      return

    }

    const duplicado = productos.some(

      (producto) =>

        producto.codigo.toUpperCase() === codigo &&

        producto.id !== productoEditando,

    )

    if (duplicado) {

      setError('Ya existe un producto con ese código.')

      return

    }

    if (

      !Number.isSafeInteger(formulario.unidadesPorCaja) ||

      formulario.unidadesPorCaja <= 0

    ) {

      setError('Las unidades por caja deben ser un entero mayor que cero.')

      return

    }

    if (

      !Number.isSafeInteger(formulario.stockMinimo) ||

      formulario.stockMinimo < 0

    ) {

      setError('El stock mínimo debe ser un entero igual o mayor que cero.')

      return

    }

    const datos: FormularioProducto = {

      ...formulario,

      codigo,

      nombre,

      marca,

      volumen,

      envase,

    }

    guardarProducto({
      ...datos,
      id: productoEditando ?? crypto.randomUUID(),
    })

    setModalAbierto(false)

  }

  function cambiarCampo<K extends keyof FormularioProducto>(

    campo: K,

    valor: FormularioProducto[K],

  ) {

    setFormulario((anterior) => ({

      ...anterior,

      [campo]: valor,

    }))

  }

  return (

    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">

            Productos

          </h1>

          <p className="mt-1 text-slate-500">

            Administración del catálogo de bebidas del depósito.

          </p>

        </div>

        <button

          onClick={abrirNuevo}

          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"

        >

          <Plus size={19} />

          Nuevo producto

        </button>

      </div>

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <p className="text-sm text-slate-500">

            Productos registrados

          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">

            {productos.length}

          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <p className="text-sm text-slate-500">

            Productos activos

          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">

            {productos.filter((p) => p.activo).length}

          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">

          <p className="text-sm text-slate-500">

            Productos inactivos

          </p>

          <p className="mt-2 text-3xl font-bold text-slate-600">

            {productos.filter((p) => !p.activo).length}

          </p>

        </div>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">

          <h2 className="flex items-center gap-2 font-semibold text-slate-800">

            <Package size={20} />

            Catálogo de productos

          </h2>

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">

            <Search size={18} className="text-slate-400" />

            <input

              type="search"

              value={busqueda}

              onChange={(e) => setBusqueda(e.target.value)}

              placeholder="Buscar producto..."

              className="w-56 max-w-full outline-none"

            />

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-slate-600">

              <tr>

                <th className="p-4">Código</th>

                <th className="p-4">Producto</th>

                <th className="p-4">Marca</th>

                <th className="p-4">Presentación</th>

                <th className="p-4">Unid./caja</th>

                <th className="p-4">Stock mínimo</th>

                <th className="p-4">Estado</th>

                <th className="p-4">Acciones</th>

              </tr>

            </thead>

            <tbody>

              {productosFiltrados.map((producto) => (

                <tr

                  key={producto.id}

                  className="border-t border-slate-100 hover:bg-slate-50"

                >

                  <td className="p-4 font-medium">{producto.codigo}</td>

                  <td className="p-4">{producto.nombre}</td>

                  <td className="p-4">{producto.marca}</td>

                  <td className="p-4">

                    {producto.volumen} · {producto.envase}

                  </td>

                  <td className="p-4">{producto.unidadesPorCaja}</td>

                  <td className="p-4">{producto.stockMinimo}</td>

                  <td className="p-4">

                    <span

                      className={`rounded-full px-3 py-1 text-xs font-medium ${

                        producto.activo

                          ? 'bg-emerald-100 text-emerald-700'

                          : 'bg-slate-200 text-slate-600'

                      }`}

                    >

                      {producto.activo ? 'Activo' : 'Inactivo'}

                    </span>

                  </td>

                  <td className="p-4">

                    <button

                      onClick={() => abrirEditar(producto)}

                      aria-label={`Editar ${producto.nombre}`}

                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"

                    >

                      <Pencil size={18} />

                    </button>

                  </td>

                </tr>

              ))}

              {productosFiltrados.length === 0 && (

                <tr>

                  <td

                    colSpan={8}

                    className="p-8 text-center text-slate-500"

                  >

                    No se encontraron productos.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {modalAbierto && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"

          role="presentation"

          onMouseDown={(e) => {

            if (e.target === e.currentTarget) {

              setModalAbierto(false)

            }

          }}

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="titulo-modal-producto"

            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"

          >

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <h2

                id="titulo-modal-producto"

                className="text-xl font-bold text-slate-800"

              >

                {productoEditando ? 'Editar producto' : 'Nuevo producto'}

              </h2>

              <button

                onClick={() => setModalAbierto(false)}

                aria-label="Cerrar formulario"

                className="text-slate-500 hover:text-slate-800"

              >

                <X size={22} />

              </button>

            </div>

            <form onSubmit={guardarFormulario} className="space-y-5 p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                {([

                  ['codigo', 'Código'],

                  ['nombre', 'Nombre del producto'],

                  ['marca', 'Marca'],

                  ['volumen', 'Volumen (ej. 355 ml)'],

                ] as const).map(([campo, etiqueta]) => (

                  <label

                    key={campo}

                    className="space-y-1 text-sm font-medium text-slate-700"

                  >

                    <span>{etiqueta}</span>

                    <input

                      required

                      value={formulario[campo]}

                      onChange={(e) =>

                        cambiarCampo(campo, e.target.value)

                      }

                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"

                    />

                  </label>

                ))}

                <label className="space-y-1 text-sm font-medium text-slate-700">

                  <span>Tipo de envase</span>

                  <select

                    value={formulario.envase}

                    onChange={(e) =>

                      cambiarCampo('envase', e.target.value)

                    }

                    className="w-full rounded-lg border border-slate-300 px-3 py-2"

                  >

                    <option>Botella plástica</option>

                    <option>Botella de vidrio</option>

                    <option>Lata</option>

                    <option>Otro</option>

                  </select>

                </label>

                <label className="space-y-1 text-sm font-medium text-slate-700">

                  <span>Unidades por caja</span>

                  <input

                    type="number"

                    min="1"

                    step="1"

                    required

                    value={formulario.unidadesPorCaja}

                    onChange={(e) =>

                      cambiarCampo(

                        'unidadesPorCaja',

                        Number(e.target.value),

                      )

                    }

                    className="w-full rounded-lg border border-slate-300 px-3 py-2"

                  />

                </label>

                <label className="space-y-1 text-sm font-medium text-slate-700">

                  <span>Stock mínimo (unidades)</span>

                  <input

                    type="number"

                    min="0"

                    step="1"

                    required

                    value={formulario.stockMinimo}

                    onChange={(e) =>

                      cambiarCampo('stockMinimo', Number(e.target.value))

                    }

                    className="w-full rounded-lg border border-slate-300 px-3 py-2"

                  />

                </label>

                <label className="space-y-1 text-sm font-medium text-slate-700">

                  <span>Estado</span>

                  <select

                    value={formulario.activo ? 'activo' : 'inactivo'}

                    onChange={(e) =>

                      cambiarCampo('activo', e.target.value === 'activo')

                    }

                    className="w-full rounded-lg border border-slate-300 px-3 py-2"

                  >

                    <option value="activo">Activo</option>

                    <option value="inactivo">Inactivo</option>

                  </select>

                </label>

              </div>

              {error && (

                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">

                  {error}

                </p>

              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button

                  type="button"

                  onClick={() => setModalAbierto(false)}

                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"

                >

                  Cancelar

                </button>

                <button

                  type="submit"

                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"

                >

                  <Save size={18} />

                  Guardar producto

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  )

}
