
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  UserCircle,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react'

import Sidebar from '../components/layout/Sidebar'
import { useInventario } from '../context/InventarioContext'
import datosDemostracion from '../data/datosDemostracion.json'

const CONFIG_KEY = 'inventario-bebidas-config-v1'
const NOTIFICACIONES_LEIDAS_KEY =
  'inventario-bebidas-notificaciones-leidas-v1'

interface Configuracion {
  nombreDeposito: string
  responsable: string
  alertasStock: boolean
}

const configuracionInicial: Configuracion = {
  nombreDeposito: datosDemostracion.configuracion.nombreDeposito,
  responsable: datosDemostracion.configuracion.responsable,
  alertasStock: true,
}

function obtenerConfiguracion(): Configuracion {
  try {
    const datos = localStorage.getItem(CONFIG_KEY)

    if (datos) {
      return {
        ...configuracionInicial,
        ...JSON.parse(datos),
      }
    }
  } catch {
    // Utilizar configuración inicial.
  }

  return configuracionInicial
}

export default function MainLayout() {
  const { productos, obtenerStock } = useInventario()
  const location = useLocation()

  const [configuracion, setConfiguracion] =
    useState<Configuracion>(obtenerConfiguracion)

  const [menuAbierto, setMenuAbierto] = useState(false)

  const [mostrarNotificaciones, setMostrarNotificaciones] =
    useState(false)

  const [alertasRevisadas, setAlertasRevisadas] = useState<string>(() => {
  try {
    return localStorage.getItem(NOTIFICACIONES_LEIDAS_KEY) ?? ''
  } catch {
    return ''
  }
})

  const notificacionesRef = useRef<HTMLDivElement>(null)

  // Actualizar los datos cuando se cambia de módulo.
  useEffect(() => {
    setConfiguracion(obtenerConfiguracion())
  }, [location.pathname])

  // Cerrar notificaciones al navegar.
  useEffect(() => {
    setMostrarNotificaciones(false)
    setMenuAbierto(false)
  }, [location.pathname])

  // Cerrar el panel al hacer clic fuera.
  useEffect(() => {
    function cerrarAlHacerClick(evento: MouseEvent) {
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(
          evento.target as Node,
        )
      ) {
        setMostrarNotificaciones(false)
      }
    }

    document.addEventListener('mousedown', cerrarAlHacerClick)

    return () => {
      document.removeEventListener('mousedown', cerrarAlHacerClick)
    }
  }, [])

  // Calcular alertas usando los movimientos reales.
  const productosConAlerta = productos
    .filter((producto) => producto.activo)
    .map((producto) => {
      const stock = obtenerStock(producto.id)

      const estado =
        stock <= 0
          ? 'AGOTADO'
          : stock <= producto.stockMinimo
            ? 'BAJO'
            : 'DISPONIBLE'

      return {
        ...producto,
        stock,
        estado,
      }
    })
    .filter((producto) => producto.estado !== 'DISPONIBLE')
    .sort((a, b) => {
      if (a.estado === b.estado) return 0
      return a.estado === 'AGOTADO' ? -1 : 1
    })

  const totalAlertas = productosConAlerta.length

  const alertasHabilitadas = configuracion.alertasStock

    // Identificar las alertas actuales del inventario.
  const firmaAlertas = JSON.stringify(
    productosConAlerta
      .map((producto) => ({
        id: producto.id,
        estado: producto.estado,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  )

  // Comprobar si las alertas actuales ya fueron revisadas.
  const hayAlertasPendientes =
    totalAlertas > 0 && firmaAlertas !== alertasRevisadas

  // Marcar las notificaciones actuales como revisadas.
  function marcarAlertasComoRevisadas() {
    setAlertasRevisadas(firmaAlertas)

    try {
      localStorage.setItem(
        NOTIFICACIONES_LEIDAS_KEY,
        firmaAlertas,
      )
    } catch {
      // Mantener el estado durante la sesión.
    }
  }

  function alternarNotificaciones() {
    if (!mostrarNotificaciones && alertasHabilitadas) {
      marcarAlertasComoRevisadas()
    }

    setMostrarNotificaciones((anterior) => !anterior)
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-50">
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}
      <Sidebar abierto={menuAbierto} cerrar={() => setMenuAbierto(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 lg:min-h-20 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            aria-controls="menu-inventario"
            aria-expanded={menuAbierto}
            className="shrink-0 rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={24} />
          </button>
          {/* Información del sistema */}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-lg">
              Sistema de Gestión de Inventarios
            </h2>

            <p className="truncate text-sm text-slate-500">
              {configuracion.nombreDeposito}
            </p>
          </div>

          {/* Usuario y notificaciones */}
          <div className="flex shrink-0 items-center gap-1 text-slate-600 sm:gap-4">
            <div
              className="relative"
              ref={notificacionesRef}
            >
              <button
                type="button"
                onClick={alternarNotificaciones}
                className="relative rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Ver notificaciones"
                aria-expanded={mostrarNotificaciones}
              >
                <Bell size={22} />

                {alertasHabilitadas && hayAlertasPendientes && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {totalAlertas > 99 ? '99+' : totalAlertas}
                  </span>
                )}
              </button>

              {/* Panel desplegable */}
              {mostrarNotificaciones && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Notificaciones
                      </h3>

                      <p className="text-xs text-slate-500">
                        Alertas del inventario
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMostrarNotificaciones(false)}
                      className="rounded-lg p-1 hover:bg-slate-100"
                      aria-label="Cerrar notificaciones"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {!alertasHabilitadas ? (
                    <div className="p-6 text-center">
                      <Bell
                        size={30}
                        className="mx-auto mb-3 text-slate-400"
                      />

                      <p className="text-sm text-slate-600">
                        Las notificaciones están desactivadas.
                      </p>

                      <Link
                        to="/configuracion"
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                      >
                        Ir a configuración
                      </Link>
                    </div>
                  ) : totalAlertas === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle2
                        size={32}
                        className="mx-auto mb-3 text-emerald-500"
                      />

                      <p className="font-medium text-slate-700">
                        Inventario sin alertas
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Todos los productos activos tienen
                        existencias superiores al stock mínimo.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-80 overflow-y-auto">
                        {productosConAlerta.map((producto) => {
                          const agotado =
                            producto.estado === 'AGOTADO'

                          return (
                            <div
                              key={producto.id}
                              className="flex gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  agotado
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-amber-100 text-amber-600'
                                }`}
                              >
                                {agotado ? (
                                  <PackageX size={21} />
                                ) : (
                                  <AlertTriangle size={21} />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  {producto.nombre}
                                </p>

                                <p
                                  className={`mt-1 text-xs font-medium ${
                                    agotado
                                      ? 'text-red-600'
                                      : 'text-amber-600'
                                  }`}
                                >
                                  {agotado
                                    ? 'Producto agotado'
                                    : 'Stock bajo'}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Existencias: {producto.stock} unidades
                                </p>

                                <p className="text-xs text-slate-500">
                                  Stock mínimo: {producto.stockMinimo}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="border-t border-slate-200 p-3">
                        <Link
                          to="/alertas"
                          className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Ver todas las alertas ({totalAlertas})
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="flex items-center gap-2">
              <UserCircle size={30} />

              <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">
                {configuracion.responsable}
              </span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
