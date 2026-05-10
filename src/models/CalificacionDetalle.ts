import { Escala } from './Escala';
import { Estudiante } from './Estudiante';

export class CalificacionDetalle {
  id: string;
  escala_id: string;
  estudiante_id: string;
  puntaje: number;
  comentario: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  escala?: Escala;
  estudiante?: Estudiante;

  constructor(
    escala_id: string,
    estudiante_id: string,
    puntaje: number,
    comentario: string = '',
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    escala?: Escala,
    estudiante?: Estudiante
  ) {
    this.id = id || this.generateId();
    this.escala_id = escala_id;
    this.estudiante_id = estudiante_id;
    this.puntaje = puntaje;
    this.comentario = comentario;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.escala = escala;
    this.estudiante = estudiante;
  }

  private generateId(): string {
    return `calif_detalle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getEscalaId(): string {
    return this.escala_id;
  }

  get getEstudianteId(): string {
    return this.estudiante_id;
  }

  get getPuntaje(): number {
    return this.puntaje;
  }

  get getComentario(): string {
    return this.comentario;
  }

  get getEscala(): Escala | undefined {
    return this.escala;
  }

  get getEstudiante(): Estudiante | undefined {
    return this.estudiante;
  }

  // Setters
  set setPuntaje(puntaje: number) {
    this.puntaje = puntaje;
    this.updated_at = new Date();
  }

  set setComentario(comentario: string) {
    this.comentario = comentario;
    this.updated_at = new Date();
  }

  set setEscala(escala: Escala) {
    this.escala = escala;
    this.updated_at = new Date();
  }

  set setEstudiante(estudiante: Estudiante) {
    this.estudiante = estudiante;
    this.updated_at = new Date();
  }
}
