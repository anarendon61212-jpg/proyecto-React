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

  // Getters
  get getId(): string {
    return this.id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getCodigo(): string {
    return this.codigo;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getCreditos(): number {
    return this.creditos;
  }

  get getIsActive(): boolean {
    return this.is_active;
  }

  get getGrupos(): Grupo[] {
    return this.grupos || [];
  }

  get getPlanesEstudio(): PlanEstudio[] {
    return this.planesEstudio || [];
  }

  get getEvaluaciones(): Evaluacion[] {
    return this.evaluaciones || [];
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updated_at = new Date();
  }

  set setDescripcion(descripcion: string) {
    this.descripcion = descripcion;
    this.updated_at = new Date();
  }

  set setCreditos(creditos: number) {
    if (this.isCreditsValid()) {
      this.creditos = creditos;
      this.updated_at = new Date();
    }
  }

  set setIsActive(is_active: boolean) {
    this.is_active = is_active;
    this.updated_at = new Date();
  }

  set setGrupos(grupos: Grupo[]) {
    this.grupos = grupos;
    this.updated_at = new Date();
  }

  set setEvaluaciones(evaluaciones: Evaluacion[]) {
    this.evaluaciones = evaluaciones;
    this.updated_at = new Date();
  }
}
