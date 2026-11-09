
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Productos from './pages/productos/Productos'
import { InventarioProvider } from './context/InventarioContext'
import Entradas from './pages/entradas/Entradas'
import Salidas from './pages/salidas/Salidas'
import Existencias from './pages/existencias/Existencias'
import Historial from './pages/historial/Historial'
import Alertas from './pages/alertas/Alertas'
import Configuracion from './pages/configuracion/Configuracion'


export default function App() {
  return (
    <InventarioProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="/productos"
              element={<Productos/>}
            />
            <Route
              path="/entradas"
              element={<Entradas />}
            />
            <Route
              path="/salidas"
              element={<Salidas />}
            />
            <Route
              path="/existencias"
              element={<Existencias />}
            />
            <Route
              path="/historial"
              element={<Historial />}
            />
            <Route
              path="/alertas"
              element={<Alertas />}
            />
            <Route
              path="/configuracion"
              element={<Configuracion />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </InventarioProvider>
  )
}
