
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  History,
  TriangleAlert,
  Settings,
  LogOut,
} from 'lucide-react'

const CONFIG_KEY = 'inventario-bebidas-config-v1'

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Productos', path: '/productos', icon: Package },
  { name: 'Entradas', path: '/entradas', icon: ArrowDownToLine },
  { name: 'Salidas', path: '/salidas', icon: ArrowUpFromLine },
  { name: 'Existencias', path: '/existencias', icon: Boxes },
  { name: 'Historial', path: '/historial', icon: History },
  { name: 'Alertas', path: '/alertas', icon: TriangleAlert },
  { name: 'Configuración', path: '/configuracion', icon: Settings },
]

function obtenerNombreDeposito(): string {
  try {
    const datos = localStorage.getItem(CONFIG_KEY)

    if (datos) {
      const configuracion = JSON.parse(datos)

      return (
        configuracion.nombreDeposito?.trim() ||
        'Depósito de demostración'
      )
    }
  } catch {
    // Utilizar el nombre predeterminado.
  }

  return 'Depósito de demostración'
}

export default function Sidebar() {
  const location = useLocation()

  const [nombreDeposito, setNombreDeposito] = useState(
    obtenerNombreDeposito,
  )

  // Actualizar cuando se navega entre módulos.
  useEffect(() => {
    setNombreDeposito(obtenerNombreDeposito())
  }, [location.pathname])

  // Actualizar cuando cambia localStorage desde otra pestaña.
  useEffect(() => {
    function actualizarConfiguracion(evento: StorageEvent) {
      if (evento.key === CONFIG_KEY || evento.key === null) {
        setNombreDeposito(obtenerNombreDeposito())
      }
    }

    window.addEventListener('storage', actualizarConfiguracion)

    return () => {
      window.removeEventListener('storage', actualizarConfiguracion)
    }
  }, [])

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-slate-900 text-white">
      {/* Información del depósito */}
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">
          Inventario
        </h1>

        <p
          className="mt-1 break-words text-sm text-slate-400"
          title={nombreDeposito}
        >
          {nombreDeposito}
        </p>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sesión de demostración */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 px-4 py-2">
          <LogOut size={20} className="text-slate-400" />

          <span className="text-sm text-slate-400">
            Sesión de demostración
          </span>
        </div>
      </div>
    </aside>
  )
}
