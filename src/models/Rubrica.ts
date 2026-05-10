import { Evaluacion } from './Evaluacion';
import { Criterio } from './Criterio';
import { Nota } from './Nota';

export class Rubrica {
  id: string;
  titulo: string;
  descripcion: string;
  es_publica: boolean;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  evaluaciones?: Evaluacion[];
  criterios?: Criterio[];
  notas?: Nota[];

  constructor(
    titulo: string,
    descripcion: string,
    es_publica: boolean = false,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    evaluaciones?: Evaluacion[],
    criterios?: Criterio[],
    notas?: Nota[]
  ) {
    this.id = id || this.generateId();
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.es_publica = es_publica;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.evaluaciones = evaluaciones || [];
    this.criterios = criterios || [];
    this.notas = notas || [];
  }

  private generateId(): string {
    return `rubrica_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isTotalWeightValid(): boolean {
    if (!this.criterios || this.criterios.length === 0) {
      return false;
    }
    const totalWeight = this.criterios.reduce((sum, criterio) => sum + criterio.peso, 0);
    return Math.abs(totalWeight - 100) < 0.01; // Permitir pequeños errores de redondeo
  }

  hasRequiredCriteria(): boolean {
    return this.criterios !== undefined && this.criterios.length > 0;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getTitulo(): string {
    return this.titulo;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getEsPublica(): boolean {
    return this.es_publica;
  }

  get getEvaluaciones(): Evaluacion[] {
    return this.evaluaciones || [];
  }

  get getCriterios(): Criterio[] {
    return this.criterios || [];
  }

  get getNotas(): Nota[] {
    return this.notas || [];
  }

  // Setters
  set setTitulo(titulo: string) {
    this.titulo = titulo;
    this.updated_at = new Date();
  }

  set setDescripcion(descripcion: string) {
    this.descripcion = descripcion;
    this.updated_at = new Date();
  }

  set setEsPublica(es_publica: boolean) {
    if (this.isTotalWeightValid()) {
      this.es_publica = es_publica;
      this.updated_at = new Date();
    }
  }

  set setEvaluaciones(evaluaciones: Evaluacion[]) {
    this.evaluaciones = evaluaciones;
    this.updated_at = new Date();
  }

  set setCriterios(criterios: Criterio[]) {
    this.criterios = criterios;
    this.updated_at = new Date();
  }

  set setNotas(notas: Nota[]) {
    this.notas = notas;
    this.updated_at = new Date();
  }
}
