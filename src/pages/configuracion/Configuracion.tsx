
import { useEffect, useState } from 'react'
import {
  Settings,
  Building2,
  Save,
  Bell,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import datosDemostracion from '../../data/datosDemostracion.json'


const CONFIG_KEY = 'inventario-bebidas-config-v1'

interface ConfiguracionSistema {
  nombreDeposito: string
  ubicacion: string
  responsable: string
  telefono: string
  moneda: string
  alertasStock: boolean
}

const configuracionInicial: ConfiguracionSistema = {
  nombreDeposito:
    datosDemostracion.configuracion?.nombreDeposito ??
    'Depósito de demostración',

  ubicacion:
    datosDemostracion.configuracion?.ubicacion ??
    'Sonsonate Centro, El Salvador',

  responsable:
    datosDemostracion.configuracion?.responsable ??
    'Administrador',

  telefono:
    datosDemostracion.configuracion?.telefono ?? '',

  moneda:
    datosDemostracion.configuracion?.moneda ?? 'USD',

  alertasStock:
    datosDemostracion.configuracion?.alertasStock ?? true,
}

function cargarConfiguracion(): ConfiguracionSistema {
  try {
    const datos = localStorage.getItem(CONFIG_KEY)
    if (datos) {
      return { ...configuracionInicial, ...JSON.parse(datos) }
    }
  } catch {
    // Mantener valores iniciales
  }
  return configuracionInicial
}

export default function Configuracion() {
  const [config, setConfig] = useState(cargarConfiguracion)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => setMensaje(''), 4000)
      return () => clearTimeout(timeout)
    }
  }, [mensaje])

  function actualizar<K extends keyof ConfiguracionSistema>(
    campo: K,
    valor: ConfiguracionSistema[K],
  ) {
    setConfig((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))
  }

  function guardarConfiguracion() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    setMensaje('Configuración guardada correctamente.')
  }

  function exportarDatos() {
    const respaldo: Record<string, unknown> = {}

    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i)
      if (clave?.startsWith('inventario-bebidas-')) {
        respaldo[clave] = localStorage.getItem(clave)
      }
    }

    const blob = new Blob(
      [JSON.stringify(respaldo, null, 2)],
      { type: 'application/json' },
    )

    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'respaldo-inventario-bebidas.json'
    enlace.click()
    URL.revokeObjectURL(url)

    setMensaje('Respaldo exportado correctamente.')
  }

  async function importarDatos(
    evento: React.ChangeEvent<HTMLInputElement>,
  ) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    try {
      const contenido = await archivo.text()
      const datos: unknown = JSON.parse(contenido)

      if (
        typeof datos !== 'object' ||
        datos === null ||
        Array.isArray(datos)
      ) {
        throw new Error('Formato inválido')
      }

      const registros = Object.entries(datos)

      if (
        registros.length === 0 ||
        !registros.every(
          ([clave, valor]) =>
            clave.startsWith('inventario-bebidas-') &&
            typeof valor === 'string',
        )
      ) {
        throw new Error('Respaldo inválido')
      }

      // Comprobar que los valores contienen JSON válido.
      for (const [, valor] of registros) {
        JSON.parse(valor as string)
      }

      if (!window.confirm(
        '¿Deseas reemplazar los datos actuales con este respaldo?',
      )) return

      for (const [clave, valor] of registros) {
        localStorage.setItem(clave, valor as string)
      }

      window.location.reload()
    } catch {
      setMensaje('No se pudo importar el respaldo. Verifica el archivo.')
    } finally {
      evento.target.value = ''
    }
  }

  function restablecerDatos() {
    const confirmar = window.confirm(
      '¿Estás seguro? Se eliminarán los productos, movimientos y configuraciones guardados en este navegador.',
    )

    if (!confirmar) return

    const claves = Object.keys(localStorage).filter(
      (clave) => clave.startsWith('inventario-bebidas-'),
    )

    claves.forEach((clave) => localStorage.removeItem(clave))
    window.location.reload()
  }

  const inputClass =
    'mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Configuración del sistema
        </h1>
        <p className="mt-1 text-slate-500">
          Administración de los parámetros generales del depósito.
        </p>
      </div>

      {mensaje && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 size={20} />
          {mensaje}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Building2 size={22} className="text-blue-600" />
            Información del depósito
          </h2>

          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Nombre del depósito
              <input
                className={inputClass}
                value={config.nombreDeposito}
                onChange={(e) =>
                  actualizar('nombreDeposito', e.target.value)
                }
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Ubicación
              <input
                className={inputClass}
                value={config.ubicacion}
                onChange={(e) =>
                  actualizar('ubicacion', e.target.value)
                }
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Responsable
              <input
                className={inputClass}
                value={config.responsable}
                onChange={(e) =>
                  actualizar('responsable', e.target.value)
                }
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Teléfono
              <input
                type="tel"
                className={inputClass}
                placeholder="Ej. 7000-0000"
                value={config.telefono}
                onChange={(e) =>
                  actualizar('telefono', e.target.value)
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Settings size={22} className="text-blue-600" />
            Parámetros generales
          </h2>

          <label className="block text-sm font-medium text-slate-700">
            Moneda del sistema
            <select
              className={inputClass}
              value={config.moneda}
              onChange={(e) =>
                actualizar('moneda', e.target.value)
              }
            >
              <option value="USD">Dólar estadounidense (USD)</option>
            </select>
          </label>

          <div className="mt-8 rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                  <Bell size={19} className="text-amber-500" />
                  Alertas de inventario
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Preferencia para mostrar notificaciones de
                  productos con existencias bajas.
                </p>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 accent-blue-600"
                checked={config.alertasStock}
                onChange={(e) =>
                  actualizar('alertasStock', e.target.checked)
                }
              />
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            El stock mínimo se configura individualmente
            desde el módulo de Productos.
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={guardarConfiguracion}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Save size={19} />
          Guardar configuración
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Database size={22} className="text-blue-600" />
          Administración de datos
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          Exporta, importa o restablece la información de demostración.
          Los datos se almacenan en este navegador.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={exportarDatos}
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 px-4 py-3 font-medium text-blue-700 hover:bg-blue-50"
          >
            <Download size={19} />
            Exportar respaldo
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-300 px-4 py-3 font-medium text-emerald-700 hover:bg-emerald-50">
            <Upload size={19} />
            Importar respaldo
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={importarDatos}
            />
          </label>

          <button
            type="button"
            onClick={restablecerDatos}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 font-medium text-red-700 hover:bg-red-50"
          >
            <RotateCcw size={19} />
            Restablecer datos
          </button>
        </div>
      </section>

      <p className="text-sm text-slate-500">
        Este sistema es un prototipo académico de gestión
        de inventarios para depósitos distribuidores de bebidas.
      </p>
    </div>
  )
}
