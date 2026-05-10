import { Inscripcion } from './Inscripcion';
import { Matricula } from './Matricula';
import { CalificacionDetalle } from './CalificacionDetalle';

export class Estudiante {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  inscripciones?: Inscripcion[];
  matriculas?: Matricula[];
  calificacionesDetalle?: CalificacionDetalle[];

  constructor(
    user_id: string,
    nombre: string,
    apellido: string,
    cedula: string,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    inscripciones?: Inscripcion[],
    matriculas?: Matricula[],
    calificacionesDetalle?: CalificacionDetalle[]
  ) {
    this.id = id || this.generateId();
    this.user_id = user_id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.cedula = cedula;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.inscripciones = inscripciones || [];
    this.matriculas = matriculas || [];
    this.calificacionesDetalle = calificacionesDetalle || [];
  }

  private generateId(): string {
    return `estudiante_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getFullName(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}
