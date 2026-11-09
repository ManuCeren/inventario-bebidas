
import { Outlet } from 'react-router-dom'
import { Bell, UserCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Sistema de Gestión de Inventarios
            </h2>
            <p className="text-sm text-slate-500">
              Depósito de demostración
            </p>
          </div>

          <div className="flex items-center gap-5 text-slate-600">
            <Bell size={21} />
            <div className="flex items-center gap-2">
              <UserCircle size={30} />
              <span className="text-sm font-medium">
                Administrador
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
