import React from 'react';
import { CriterionApi, RubricApi, ScaleApi } from '../../services/rubricaService';

type SubjectLike = {
  nombre?: string;
  name?: string;
  codigo?: string;
  code?: string;
};

type GroupLike = {
  nombre?: string;
  name?: string;
  codigo_grupo?: string;
  group_code?: string;
};

type Props = {
  evaluationName: string;
  subjectLabel: string;
  groupLabel: string;
  rubric: RubricApi | null;
  criteria: CriterionApi[];
  scalesByCriterionId: Map<string, ScaleApi[]>;
  emptyMessage?: string;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'No disponible';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const RubricReadOnlyPanel: React.FC<Props> = ({
  evaluationName,
  subjectLabel,
  groupLabel,
  rubric,
  criteria,
  scalesByCriterionId,
  emptyMessage,
}) => {
  if (!rubric) {
    return (
      <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
        {emptyMessage || 'Esta evaluación aún no tiene una rúbrica asociada.'}
      </div>
    );
  }

  const sortedCriteria = [...criteria].sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-stroke pb-4 dark:border-strokedark sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">{rubric.title}</h3>
          <p className="mt-1 text-sm text-bodydark2">{rubric.description}</p>
          <p className="mt-2 text-xs text-bodydark2">
            Publicada el {formatDateTime(rubric.created_at || rubric.updated_at)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${rubric.is_public ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
          >
            {rubric.is_public ? 'Rúbrica pública' : 'Rúbrica privada'}
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {sortedCriteria.length} criterios
          </span>
        </div>
      </div>

      <div className="rounded border border-stroke p-4 dark:border-strokedark">
        <p className="text-sm font-medium text-black dark:text-white">
          Evaluación seleccionada: <span className="font-semibold">{evaluationName}</span>
        </p>
        <p className="mt-1 text-sm text-bodydark2">{subjectLabel}</p>
        <p className="text-sm text-bodydark2">{groupLabel}</p>
      </div>

      <div className="space-y-4">
        {sortedCriteria.map((criterion, index) => {
          const criterionScales = scalesByCriterionId.get(criterion.id) || [];

          return (
            <article key={criterion.id} className="rounded-lg border border-stroke p-4 dark:border-strokedark">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-black dark:text-white">
                      {index + 1}. {criterion.name}
                    </h4>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {criterion.weight}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-bodydark2">{criterion.description}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                  {criterionScales.length} niveles
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {criterionScales.map((scale) => (
                  <div
                    key={scale.id}
                    className="rounded border border-stroke bg-gray-50 p-3 dark:border-strokedark dark:bg-meta-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-black dark:text-white">{scale.name}</p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-primary shadow-sm dark:bg-boxdark">
                        {scale.value}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-bodydark2">{scale.description}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(RubricReadOnlyPanel);
