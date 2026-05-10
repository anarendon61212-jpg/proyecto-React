import { Asignatura } from './Asignatura';
import { Rubrica } from './Rubrica';

export class Evaluacion {
  id: string;
  asignatura_id: string;
  rubrica_id: string;
  nombre: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  asignatura?: Asignatura;
  rubrica?: Rubrica;

  constructor(
    asignatura_id: string,
    rubrica_id: string,
    nombre: string,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    asignatura?: Asignatura,
    rubrica?: Rubrica
  ) {
    this.id = id || this.generateId();
    this.asignatura_id = asignatura_id;
    this.rubrica_id = rubrica_id;
    this.nombre = nombre;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.asignatura = asignatura;
    this.rubrica = rubrica;
  }

  private generateId(): string {
    return `evaluacion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
