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

  // Getters
  get getId(): string {
    return this.id;
  }

  get getAsignaturaId(): string {
    return this.asignatura_id;
  }

  get getRubricaId(): string {
    return this.rubrica_id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getAsignatura(): Asignatura | undefined {
    return this.asignatura;
  }

  get getRubrica(): Rubrica | undefined {
    return this.rubrica;
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updated_at = new Date();
  }

  set setAsignatura(asignatura: Asignatura) {
    this.asignatura = asignatura;
    this.updated_at = new Date();
  }

  set setRubrica(rubrica: Rubrica) {
    this.rubrica = rubrica;
    this.updated_at = new Date();
  }
}
