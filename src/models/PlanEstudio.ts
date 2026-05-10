import { Asignatura } from './Asignatura';
import { Carrera } from './Carrera';

export class PlanEstudio {
  id: string;
  carrera_id: string;
  asignatura_id: string;
  nombre: string;
  anio: number;
  semestre_sugerido: number;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  asignatura?: Asignatura;
  carrera?: Carrera;

  constructor(
    carrera_id: string,
    asignatura_id: string,
    nombre: string,
    anio: number,
    semestre_sugerido: number,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    asignatura?: Asignatura,
    carrera?: Carrera
  ) {
    this.id = id || this.generateId();
    this.carrera_id = carrera_id;
    this.asignatura_id = asignatura_id;
    this.nombre = nombre;
    this.anio = anio;
    this.semestre_sugerido = semestre_sugerido;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.asignatura = asignatura;
    this.carrera = carrera;
  }

  private generateId(): string {
    return `plan_estudio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getCarreraId(): string {
    return this.carrera_id;
  }

  get getAsignaturaId(): string {
    return this.asignatura_id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getAnio(): number {
    return this.anio;
  }

  get getSemestreSugerido(): number {
    return this.semestre_sugerido;
  }

  get getAsignatura(): Asignatura | undefined {
    return this.asignatura;
  }

  get getCarrera(): Carrera | undefined {
    return this.carrera;
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updated_at = new Date();
  }

  set setAnio(anio: number) {
    this.anio = anio;
    this.updated_at = new Date();
  }

  set setSemestreSugerido(semestre_sugerido: number) {
    this.semestre_sugerido = semestre_sugerido;
    this.updated_at = new Date();
  }

  set setAsignatura(asignatura: Asignatura) {
    this.asignatura = asignatura;
    this.updated_at = new Date();
  }

  set setCarrera(carrera: Carrera) {
    this.carrera = carrera;
    this.updated_at = new Date();
  }
}
