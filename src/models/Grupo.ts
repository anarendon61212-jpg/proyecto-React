import { Semestre } from './Semestre';
import { Docente } from './Docente';
import { Asignatura } from './Asignatura';
import { Inscripcion } from './Inscripcion';

export class Grupo {
  id: string;
  nombre: string;
  codigo_grupo: string;
  semestre_id: string;
  docente_id: string;
  asignatura_id: string;
  created_at: Date;
  updated_at: Date;

  // Relaciones
  semestre?: Semestre;
  docente?: Docente;
  asignatura?: Asignatura;
  inscripciones?: Inscripcion[];

  constructor(
    nombre: string,
    codigo_grupo: string,
    semestre_id: string,
    docente_id: string,
    asignatura_id: string,
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    semestre?: Semestre,
    docente?: Docente,
    asignatura?: Asignatura,
    inscripciones?: Inscripcion[]
  ) {
    this.id = id || this.generateId();
    this.nombre = nombre;
    this.codigo_grupo = codigo_grupo;
    this.semestre_id = semestre_id;
    this.docente_id = docente_id;
    this.asignatura_id = asignatura_id;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.semestre = semestre;
    this.docente = docente;
    this.asignatura = asignatura;
    this.inscripciones = inscripciones || [];
  }

  private generateId(): string {
    return `grupo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hasRequiredFields(): boolean {
    return !!this.semestre_id && !!this.docente_id && !!this.asignatura_id;
  }
}
