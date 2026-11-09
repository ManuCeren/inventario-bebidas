
export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

export interface Movimiento {
  id: string
  productoId: string
  tipo: TipoMovimiento
  fecha: string
  cajas: number
  unidadesSueltas: number
  unidadesPorCaja: number
  cantidadTotal: number
  observaciones: string
}
