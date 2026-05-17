
















import { Carrera } from './Carrera';

export interface PlanEstudio {
  id: string;
  career_id: string;
  name: string;
  year: number;
  suggested_semester: number;
  is_published: boolean;
  created_at?: Date;
  updated_at?: Date;
  carrera?: Carrera;
}
}
