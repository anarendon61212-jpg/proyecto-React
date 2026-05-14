import React from 'react';
import CriterionSelector from './CriterionSelector';
import type { StudentGradeState } from '../../types/grade';

type Props = {
  data: StudentGradeState;
  onChangeScale: (enrollmentId: string, criterionId: string, scaleId: string | null) => void;
  onChangeComment: (enrollmentId: string, criterionId: string, comment: string) => void;
  onSaveDraft: (enrollmentId: string) => Promise<any>;
  onSubmit: (enrollmentId: string) => Promise<any>;
  saving?: boolean;
  missingCriteria?: Set<string> | null;
};

const StudentGradeCard: React.FC<Props> = ({ data, onChangeScale, onChangeComment, onSaveDraft, onSubmit, saving, missingCriteria }) => {
  return (
    <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-md font-semibold text-black dark:text-white">{data.student_name || data.student_id}</h4>
          <p className="text-xs text-bodydark2">Inscripción: {data.enrollment_id}</p>
          <div className="mt-1">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${data.status === 'SENT' ? 'bg-success/10 text-success' : data.status === 'DRAFT' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
              {data.status || 'UNSAVED'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSaveDraft(data.enrollment_id)}
            disabled={!!saving}
            className="rounded border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(data.enrollment_id)}
            disabled={!!saving}
            className="rounded bg-success px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.criteria.map((criterion) => (
          <CriterionSelector
            key={criterion.criterion_id}
            criterion={criterion}
            onChangeScale={(criterionId, scaleId) => onChangeScale(data.enrollment_id, criterionId, scaleId)}
            onChangeComment={(criterionId, comment) => onChangeComment(data.enrollment_id, criterionId, comment)}
            showError={!!missingCriteria && missingCriteria.has(criterion.criterion_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(StudentGradeCard);
