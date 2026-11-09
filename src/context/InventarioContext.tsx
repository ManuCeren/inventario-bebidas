
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Producto } from '../types/Producto'
import type { Movimiento } from '../types/Movimiento'

import datosDemostracion from '../data/datosDemostracion.json'

// Claves utilizadas para conservar los registros
const PRODUCTOS_KEY = 'inventario-bebidas-productos-v1'
const MOVIMIENTOS_KEY = 'inventario-bebidas-movimientos-v1'

// Estructura del contexto
interface InventarioContextType {
  productos: Producto[]
  movimientos: Movimiento[]
  guardarProducto: (producto: Producto) => void
  registrarMovimiento: (movimiento: Movimiento) => void
  obtenerStock: (productoId: string) => number
}

const InventarioContext = createContext<
  InventarioContextType | undefined
>(undefined)

// Datos iniciales recuperados del respaldo
const productosIniciales: Producto[] =
  datosDemostracion.productos as Producto[]

const movimientosIniciales: Movimiento[] =
  datosDemostracion.movimientos as Movimiento[]

// Cargar datos guardados o utilizar los iniciales
function cargarDatos<T>(clave: string, iniciales: T): T {
  try {
    const guardados = localStorage.getItem(clave)

    if (guardados !== null) {
      return JSON.parse(guardados) as T
    }
  } catch (error) {
    console.error(
      `Error al cargar los datos de ${clave}:`,
      error,
    )
  }

  return iniciales
}

// Proveedor principal del inventario
export function InventarioProvider({
  children,
}: {
  children: ReactNode
}) {
  // Productos registrados
  const [productos, setProductos] = useState<Producto[]>(() =>
    cargarDatos(PRODUCTOS_KEY, productosIniciales),
  )

  // Movimientos de entrada y salida
  const [movimientos, setMovimientos] = useState<Movimiento[]>(() =>
    cargarDatos(MOVIMIENTOS_KEY, movimientosIniciales),
  )

  // Guardar productos automáticamente
  useEffect(() => {
    try {
      localStorage.setItem(
        PRODUCTOS_KEY,
        JSON.stringify(productos),
      )
    } catch (error) {
      console.error('Error al guardar productos:', error)
    }
  }, [productos])

  // Guardar movimientos automáticamente
  useEffect(() => {
    try {
      localStorage.setItem(
        MOVIMIENTOS_KEY,
        JSON.stringify(movimientos),
      )
    } catch (error) {
      console.error('Error al guardar movimientos:', error)
    }
  }, [movimientos])

  // Registrar o actualizar un producto
  function guardarProducto(producto: Producto) {
    setProductos((anteriores) => {
      const existe = anteriores.some(
        (p) => p.id === producto.id,
      )

      if (existe) {
        return anteriores.map((p) =>
          p.id === producto.id ? producto : p,
        )
      }

      return [...anteriores, producto]
    })
  }

  // Registrar una entrada o salida
  function registrarMovimiento(movimiento: Movimiento) {
    setMovimientos((anteriores) => [
      movimiento,
      ...anteriores,
    ])
  }

  // Calcular existencias de un producto
  function obtenerStock(productoId: string): number {
    return movimientos.reduce((total, movimiento) => {
      if (movimiento.productoId !== productoId) {
        return total
      }

      if (movimiento.tipo === 'ENTRADA') {
        return total + movimiento.cantidadTotal
      }

      if (movimiento.tipo === 'SALIDA') {
        return total - movimiento.cantidadTotal
      }

      return total
    }, 0)
  }

  return (
    <InventarioContext.Provider
      value={{
        productos,
        movimientos,
        guardarProducto,
        registrarMovimiento,
        obtenerStock,
      }}
    >
      {children}
    </InventarioContext.Provider>
  )
}

// Hook para utilizar el inventario
export function useInventario() {
  const contexto = useContext(InventarioContext)

  if (!contexto) {
    throw new Error(
      'useInventario debe utilizarse dentro de InventarioProvider',
    )
  }

  return contexto
}
