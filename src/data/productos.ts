
import type { Producto } from '../types/Producto'

export const productosIniciales: Producto[] = [
  {
    id: '1',
    codigo: 'BEB001',
    nombre: 'Coca-Cola 355 ml',
    marca: 'Coca-Cola',
    volumen: '355 ml',
    envase: 'Lata',
    unidadesPorCaja: 24,
    stockMinimo: 24,
    activo: true,
  },
  {
    id: '2',
    codigo: 'BEB002',
    nombre: 'Coca-Cola 2 L',
    marca: 'Coca-Cola',
    volumen: '2 L',
    envase: 'Botella plástica',
    unidadesPorCaja: 6,
    stockMinimo: 12,
    activo: true,
  },
  {
    id: '3',
    codigo: 'BEB003',
    nombre: 'Sprite 355 ml',
    marca: 'Sprite',
    volumen: '355 ml',
    envase: 'Lata',
    unidadesPorCaja: 24,
    stockMinimo: 24,
    activo: true,
  },
  {
    id: '4',
    codigo: 'BEB004',
    nombre: 'Fanta Naranja 355 ml',
    marca: 'Fanta',
    volumen: '355 ml',
    envase: 'Lata',
    unidadesPorCaja: 24,
    stockMinimo: 24,
    activo: true,
  },
]
