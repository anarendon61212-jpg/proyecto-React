import { Matricula } from './Matricula';
import { PlanEstudio } from './PlanEstudio';

export class Carrera {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  matriculas?: Matricula[];
  planesEstudio?: PlanEstudio[];

  constructor(
    nombre: string,
    codigo: string,
    descripcion: string,
    id?: string,
    is_active: boolean = true,
    created_at?: Date,
    updated_at?: Date,
    matriculas?: Matricula[],
    planesEstudio?: PlanEstudio[]
  ) {
    this.id = id || this.generateId();
    this.nombre = nombre;
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.is_active = is_active;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.matriculas = matriculas || [];
    this.planesEstudio = planesEstudio || [];
  }

  private generateId(): string {
    return `carrera_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
