import { Rubrica } from './Rubrica';
import { Escala } from './Escala';

export class Criterio {
  id: string;
  rubrica_id: string;
  nombre: string;
  descripcion: string;
  peso: number; // Porcentaje (0-100)
  created_at: Date;
  updated_at: Date;

  // Relaciones
  rubrica?: Rubrica;
  escalas?: Escala[];

  constructor(
    rubrica_id: string,
    nombre: string,
    descripcion: string,
    peso: number,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    rubrica?: Rubrica,
    escalas?: Escala[]
  ) {
    this.id = id || this.generateId();
    this.rubrica_id = rubrica_id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.peso = peso;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.rubrica = rubrica;
    this.escalas = escalas || [];
  }

  private generateId(): string {
    return `criterio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isWeightValid(): boolean {
    return this.peso > 0 && this.peso <= 100;
  }

  // Getters
  get getId(): string {
    return this.id;
  }

  get getRubricaId(): string {
    return this.rubrica_id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getDescripcion(): string {
    return this.descripcion;
  }

  get getPeso(): number {
    return this.peso;
  }

  get getRubrica(): Rubrica | undefined {
    return this.rubrica;
  }

  get getEscalas(): Escala[] {
    return this.escalas || [];
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

  set setPeso(peso: number) {
    if (this.isWeightValid()) {
      this.peso = peso;
      this.updated_at = new Date();
    }
  }

  set setRubrica(rubrica: Rubrica) {
    this.rubrica = rubrica;
    this.updated_at = new Date();
  }

  set setEscalas(escalas: Escala[]) {
    this.escalas = escalas;
    this.updated_at = new Date();
  }
}
