import { Criterio } from './Criterio';
import { CalificacionDetalle } from './CalificacionDetalle';

export class Escala {
  id: string;
  criterio_id: string;
  nombre: string;
  descripcion: string;
  valor: number; // Valor numérico único por criterio
  created_at: Date;
  updated_at: Date;

  // Relaciones
  criterio?: Criterio;
  calificacionesDetalle?: CalificacionDetalle[];

  constructor(
    criterio_id: string,
    nombre: string,
    descripcion: string,
    valor: number,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    criterio?: Criterio,
    calificacionesDetalle?: CalificacionDetalle[]
  ) {
    this.id = id || this.generateId();
    this.criterio_id = criterio_id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.valor = valor;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.criterio = criterio;
    this.calificacionesDetalle = calificacionesDetalle || [];
  }

  private generateId(): string {
    return `escala_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getCriterioId(): string {
    return this.criterio_id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getValor(): number {
    return this.valor;
  }

  get getCriterio(): Criterio | undefined {
    return this.criterio;
  }

  get getCalificacionesDetalle(): CalificacionDetalle[] {
    return this.calificacionesDetalle || [];
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updated_at = new Date();
  }

  set setDescripcion(descripcion: string) {
    this.descripcion = descripcion;
    this.updated_at = new Date();
  }

  set setValor(valor: number) {
    this.valor = valor;
    this.updated_at = new Date();
  }

  set setCriterio(criterio: Criterio) {
    this.criterio = criterio;
    this.updated_at = new Date();
  }

  set setCalificacionesDetalle(calificacionesDetalle: CalificacionDetalle[]) {
    this.calificacionesDetalle = calificacionesDetalle;
    this.updated_at = new Date();
  }
}
