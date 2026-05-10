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

  // Getters
  get getId(): string {
    return this.id;
  }

  get getUserId(): string {
    return this.user_id;
  }

  get getNombre(): string {
    return this.nombre;
  }

  get getApellido(): string {
    return this.apellido;
  }

  get getCedula(): string {
    return this.cedula;
  }

  get getTelefono(): string {
    return this.telefono;
  }

  get getEspecialidad(): string {
    return this.especialidad;
  }

  get getGrupos(): Grupo[] {
    return this.grupos || [];
  }

  // Setters
  set setNombre(nombre: string) {
    this.nombre = nombre;
    this.updated_at = new Date();
  }

  set setApellido(apellido: string) {
    this.apellido = apellido;
    this.updated_at = new Date();
  }

  set setTelefono(telefono: string) {
    this.telefono = telefono;
    this.updated_at = new Date();
  }

  set setEspecialidad(especialidad: string) {
    this.especialidad = especialidad;
    this.updated_at = new Date();
  }

  set setGrupos(grupos: Grupo[]) {
    this.grupos = grupos;
    this.updated_at = new Date();
  }
}
