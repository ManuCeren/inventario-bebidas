
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  UserCircle,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  X,
} from 'lucide-react'

import Sidebar from '../components/layout/Sidebar'
import { useInventario } from '../context/InventarioContext'

const CONFIG_KEY = 'inventario-bebidas-config-v1'

interface Configuracion {
  nombreDeposito: string
  responsable: string
  alertasStock: boolean
}

const configuracionInicial: Configuracion = {
  nombreDeposito: 'Depósito de demostración',
  responsable: 'Administrador',
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

  const [mostrarNotificaciones, setMostrarNotificaciones] =
    useState(false)

  const notificacionesRef = useRef<HTMLDivElement>(null)

  // Actualizar los datos cuando se cambia de módulo.
  useEffect(() => {
    setConfiguracion(obtenerConfiguracion())
  }, [location.pathname])

  // Cerrar notificaciones al navegar.
  useEffect(() => {
    setMostrarNotificaciones(false)
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          {/* Información del sistema */}
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              Sistema de Gestión de Inventarios
            </h2>

            <p className="truncate text-sm text-slate-500">
              {configuracion.nombreDeposito}
            </p>
          </div>

          {/* Usuario y notificaciones */}
          <div className="flex shrink-0 items-center gap-4 text-slate-600 sm:gap-5">
            <div
              className="relative"
              ref={notificacionesRef}
            >
              <button
                type="button"
                onClick={() =>
                  setMostrarNotificaciones((anterior) => !anterior)
                }
                className="relative rounded-lg p-2 transition hover:bg-slate-100"
                aria-label="Ver notificaciones"
                aria-expanded={mostrarNotificaciones}
              >
                <Bell size={22} />

                {alertasHabilitadas && totalAlertas > 0 && (
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

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
