export type GradeDetailPayload = {
  scale_id: string;
  comment?: string;
};

export type GradePayload = {
  evaluation_id: string;
  enrollment_id: string;
  status: 'DRAFT' | 'SENT';
  details: GradeDetailPayload[];
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
  criteria: CriterionOption[];
  status?: 'DRAFT' | 'SENT' | 'UNSAVED';
};
