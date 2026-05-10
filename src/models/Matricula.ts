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

  // Getters
  get getId(): string {
    return this.id;
  }

  get getEstudianteId(): string {
    return this.estudiante_id;
  }

  get getCarreraId(): string {
    return this.carrera_id;
  }

  get getPeriodoIngreso(): string {
    return this.periodo_ingreso;
  }

  get getEstadoAcademico(): string {
    return this.estado_academico;
  }

  get getEstudiante(): Estudiante | undefined {
    return this.estudiante;
  }

  get getCarrera(): Carrera | undefined {
    return this.carrera;
  }

  // Setters
  set setPeriodoIngreso(periodo_ingreso: string) {
    this.periodo_ingreso = periodo_ingreso;
    this.updated_at = new Date();
  }

  set setEstadoAcademico(estado_academico: 'activo' | 'retirado' | 'suspendido') {
    this.estado_academico = estado_academico;
    this.updated_at = new Date();
  }

  set setEstudiante(estudiante: Estudiante) {
    this.estudiante = estudiante;
    this.updated_at = new Date();
  }

  set setCarrera(carrera: Carrera) {
    this.carrera = carrera;
    this.updated_at = new Date();
  }
}
