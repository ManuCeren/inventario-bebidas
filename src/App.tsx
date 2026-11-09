
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/dashboard/Dashboard'

function ModuloPendiente({ nombre }: { nombre: string }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800">
        {nombre}
      </h1>
      <p className="mt-2 text-slate-500">
        Este módulo se implementará en la siguiente etapa.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="productos"
            element={<ModuloPendiente nombre="Productos" />}
          />
          <Route
            path="entradas"
            element={<ModuloPendiente nombre="Entradas" />}
          />
          <Route
            path="salidas"
            element={<ModuloPendiente nombre="Salidas" />}
          />
          <Route
            path="existencias"
            element={<ModuloPendiente nombre="Existencias" />}
          />
          <Route
            path="historial"
            element={<ModuloPendiente nombre="Historial" />}
          />
          <Route
            path="alertas"
            element={<ModuloPendiente nombre="Alertas" />}
          />
          <Route
            path="configuracion"
            element={<ModuloPendiente nombre="Configuración" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
