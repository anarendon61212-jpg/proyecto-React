import { Inscripcion } from './Inscripcion';
import { Rubrica } from './Rubrica';
import { CalificacionDetalle } from './CalificacionDetalle';

export class Nota {
  id: string;
  inscripcion_id: string;
  rubrica_id: string;
  nota_final: number;
  observaciones: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  inscripcion?: Inscripcion;
  rubrica?: Rubrica;
  calificacionesDetalle?: CalificacionDetalle[];

  constructor(
    inscripcion_id: string,
    rubrica_id: string,
    nota_final: number,
    observaciones: string = '',
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    inscripcion?: Inscripcion,
    rubrica?: Rubrica,
    calificacionesDetalle?: CalificacionDetalle[]
  ) {
    this.id = id || this.generateId();
    this.inscripcion_id = inscripcion_id;
    this.rubrica_id = rubrica_id;
    this.nota_final = nota_final;
    this.observaciones = observaciones;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.inscripcion = inscripcion;
    this.rubrica = rubrica;
    this.calificacionesDetalle = calificacionesDetalle || [];
  }

  private generateId(): string {
    return `nota_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateFinalGrade(calificacionesDetalle: CalificacionDetalle[]): number {
    if (!calificacionesDetalle || calificacionesDetalle.length === 0) {
      return 0;
    }
    const totalPuntaje = calificacionesDetalle.reduce((sum, detalle) => sum + detalle.puntaje, 0);
    return totalPuntaje / calificacionesDetalle.length;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getInscripcionId(): string {
    return this.inscripcion_id;
  }

  get getRubricaId(): string {
    return this.rubrica_id;
  }

  get getNotaFinal(): number {
    return this.nota_final;
  }

  get getObservaciones(): string {
    return this.observaciones;
  }

  get getInscripcion(): Inscripcion | undefined {
    return this.inscripcion;
  }

  get getRubrica(): Rubrica | undefined {
    return this.rubrica;
  }

  // Setters
  set setNotaFinal(nota_final: number) {
    this.nota_final = nota_final;
    this.updated_at = new Date();
  }

  set setObservaciones(observaciones: string) {
    this.observaciones = observaciones;
    this.updated_at = new Date();
  }

  set setInscripcion(inscripcion: Inscripcion) {
    this.inscripcion = inscripcion;
    this.updated_at = new Date();
  }

  set setRubrica(rubrica: Rubrica) {
    this.rubrica = rubrica;
    this.updated_at = new Date();
  }
}
