export type GradeDetailPayload = {
  scale_id: string;
  comment?: string;
};

export type GradePayload = {
  evaluation_id: string;
  enrollment_id: string;
  status: 'DRAFT' | 'SENT';
  observations?: string;
  details: GradeDetailPayload[];
};

export type GradeDetailApi = {
  scale_id: string;
  student_id?: string;
  score?: number;
  comment?: string;
};

export type GradeApi = {
  id?: string;
  enrollment_id: string;
  rubric_id?: string;
  final_score?: number;
  status: 'DRAFT' | 'SENT' | string;
  observations?: string;
  is_locked?: boolean;
  details?: GradeDetailApi[];
  created_at?: string;
  updated_at?: string;
};

export type ScaleOption = {
  id: string;
  name: string;
  description?: string;
  value: number;
};

export type CriterionOption = {
  criterion_id: string;
  name: string;
  weight?: number;
  scales: ScaleOption[];
  selected_scale_id?: string | null;
  comment?: string;
};

export type StudentGradeState = {
  enrollment_id: string;
  student_id: string;
  student_name?: string;
  observations?: string;
  is_locked?: boolean;
  criteria: CriterionOption[];
  status?: 'DRAFT' | 'SENT' | 'UNSAVED';
};
