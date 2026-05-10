import { Estudiante } from './Estudiante';
import { Carrera } from './Carrera';

export class Matricula {
  id: string;
  estudiante_id: string;
  carrera_id: string;
  periodo_ingreso: string;
  estado_academico: 'activo' | 'retirado' | 'suspendido';
  created_at: Date;
  updated_at: Date;

  // Relaciones
  estudiante?: Estudiante;
  carrera?: Carrera;

  constructor(
    estudiante_id: string,
    carrera_id: string,
    periodo_ingreso: string,
    estado_academico: 'activo' | 'retirado' | 'suspendido' = 'activo',
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    estudiante?: Estudiante,
    carrera?: Carrera
  ) {
    this.id = id || this.generateId();
    this.estudiante_id = estudiante_id;
    this.carrera_id = carrera_id;
    this.periodo_ingreso = periodo_ingreso;
    this.estado_academico = estado_academico;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.estudiante = estudiante;
    this.carrera = carrera;
  }

  private generateId(): string {
    return `matricula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isActive(): boolean {
    return this.estado_academico === 'activo';
  }
}
