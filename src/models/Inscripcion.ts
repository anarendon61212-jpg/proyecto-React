import { Estudiante } from './Estudiante';
import { Grupo } from './Grupo';
import { Nota } from './Nota';

export class Inscripcion {
  id: string;
  estudiante_id: string;
  grupo_id: string;
  fecha_inscripcion: Date;
  estado: 'activo' | 'cancelado';
  created_at: Date;
  updated_at: Date;

  // Relaciones
  estudiante?: Estudiante;
  grupo?: Grupo;
  notas?: Nota[];

  constructor(
    estudiante_id: string,
    grupo_id: string,
    fecha_inscripcion: Date,
    estado: 'activo' | 'cancelado' = 'activo',
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    estudiante?: Estudiante,
    grupo?: Grupo,
    notas?: Nota[]
  ) {
    this.id = id || this.generateId();
    this.estudiante_id = estudiante_id;
    this.grupo_id = grupo_id;
    this.fecha_inscripcion = fecha_inscripcion;
    this.estado = estado;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.estudiante = estudiante;
    this.grupo = grupo;
    this.notas = notas || [];
  }

  private generateId(): string {
    return `inscripcion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isActive(): boolean {
    return this.estado === 'activo';
  }
}
