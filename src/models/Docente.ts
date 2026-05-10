import { Grupo } from './Grupo';

export class Docente {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  especialidad: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  grupos?: Grupo[];

  constructor(
    user_id: string,
    nombre: string,
    apellido: string,
    cedula: string,
    telefono: string,
    especialidad: string,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    grupos?: Grupo[]
  ) {
    this.id = id || this.generateId();
    this.user_id = user_id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.cedula = cedula;
    this.telefono = telefono;
    this.especialidad = especialidad;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.grupos = grupos || [];
  }

  private generateId(): string {
    return `docente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getFullName(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}
