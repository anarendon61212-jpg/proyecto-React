import { Grupo } from './Grupo';
import { PlanEstudio } from './PlanEstudio';
import { Evaluacion } from './Evaluacion';

export interface Asignatura {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;

  // Relaciones
  grupos?: Grupo[];
  planesEstudio?: PlanEstudio[];
  evaluaciones?: Evaluacion[];
}
