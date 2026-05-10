import { Grupo } from './Grupo';

export class Semestre {
  id: string;
  nombre: string;
  codigo: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: boolean; // true = activo, false = cerrado
  created_at: Date;
  updated_at: Date;

  // Relaciones
  grupos?: Grupo[];

  constructor(
    nombre: string,
    codigo: string,
    fecha_inicio: Date,
    fecha_fin: Date,
    estado: boolean = true,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    grupos?: Grupo[]
  ) {
    this.id = id || this.generateId();
    this.nombre = nombre;
    this.codigo = codigo;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.estado = estado;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.grupos = grupos || [];
  }

  private generateId(): string {
    return `semestre_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isDateValid(): boolean {
    return this.fecha_inicio < this.fecha_fin;
  }
}
