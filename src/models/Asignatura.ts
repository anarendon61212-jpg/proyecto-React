import { Grupo } from './Grupo';
import { PlanEstudio } from './PlanEstudio';
import { Evaluacion } from './Evaluacion';

export class Asignatura {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  creditos: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  grupos?: Grupo[];
  planesEstudio?: PlanEstudio[];
  evaluaciones?: Evaluacion[];

  constructor(
    nombre: string,
    codigo: string,
    descripcion: string,
    creditos: number,
    id?: string,
    is_active: boolean = true,
    created_at?: Date,
    updated_at?: Date,
    grupos?: Grupo[],
    planesEstudio?: PlanEstudio[],
    evaluaciones?: Evaluacion[]
  ) {
    this.id = id || this.generateId();
    this.nombre = nombre;
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.creditos = creditos;
    this.is_active = is_active;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.grupos = grupos || [];
    this.planesEstudio = planesEstudio || [];
    this.evaluaciones = evaluaciones || [];
  }

  private generateId(): string {
    return `asignatura_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isCreditsValid(): boolean {
    return this.creditos > 0;
  }
}
