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

  // Getters
  get getId(): string {
    return this.id;
  }

  get getEstudianteId(): string {
    return this.estudiante_id;
  }

  get getGrupoId(): string {
    return this.grupo_id;
  }

  get getFechaInscripcion(): Date {
    return this.fecha_inscripcion;
  }

  get getEstado(): string {
    return this.estado;
  }

  get getEstudiante(): Estudiante | undefined {
    return this.estudiante;
  }

  get getGrupo(): Grupo | undefined {
    return this.grupo;
  }

  get getNotas(): Nota[] {
    return this.notas || [];
  }

  // Setters
  set setEstado(estado: 'activo' | 'cancelado') {
    this.estado = estado;
    this.updated_at = new Date();
  }

  set setEstudiante(estudiante: Estudiante) {
    this.estudiante = estudiante;
    this.updated_at = new Date();
  }

  set setGrupo(grupo: Grupo) {
    this.grupo = grupo;
    this.updated_at = new Date();
  }

  set setNotas(notas: Nota[]) {
    this.notas = notas;
    this.updated_at = new Date();
  }
}
