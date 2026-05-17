import React from 'react';
import type { StudentGradeDetail } from '../../hooks/useStudentGrades';

interface StudentGradeDetailViewProps {
  gradeDetail: StudentGradeDetail;
  onDownloadReport?: () => void;
}

const StudentGradeDetailView: React.FC<StudentGradeDetailViewProps> = ({
  gradeDetail,
  onDownloadReport,
}) => {
  const formatScore = (value: number | null) => {
    if (value === null) return '-';
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">
            {gradeDetail.evaluation_name}
          </h3>
          <p className="mt-1 text-sm text-bodydark2">{gradeDetail.subject_name}</p>
          <p className="text-sm text-bodydark2">{gradeDetail.group_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Calificación oficial
          </span>
          {onDownloadReport && (
            <button
              type="button"
              onClick={onDownloadReport}
              className="rounded border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white"
            >
              Descargar reporte
            </button>
          )}
        </div>
      </div>

      {/* Final Score */}
      <div className="rounded border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-black dark:text-white">
              Nota Final
            </h4>
            <p className="mt-1 text-sm text-bodydark2">
              Calificación oficial enviada por el docente
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-primary">
              {formatScore(gradeDetail.final_score)}
            </p>
            <p className="mt-1 text-xs text-bodydark2">Puntos</p>
          </div>
        </div>

        {gradeDetail.observations && (
          <div className="mt-4 rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4">
            <p className="text-sm font-medium text-black dark:text-white">
              Observaciones del docente:
            </p>
            <p className="mt-1 text-sm text-bodydark2">{gradeDetail.observations}</p>
          </div>
        )}
      </div>

      {/* Criteria Details */}
      <div className="rounded border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Desglose por Criterio
        </h4>

        {gradeDetail.criteria_details.length === 0 ? (
          <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
            No hay detalles de calificación disponibles para esta evaluación.
          </div>
        ) : (
          <div className="space-y-4">
            {gradeDetail.criteria_details.map((detail) => (
              <article
                key={detail.criterion_id}
                className="rounded-lg border border-stroke p-4 dark:border-strokedark"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-base font-semibold text-black dark:text-white">
                        {detail.criterion_name}
                      </h5>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {detail.criterion_weight}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-bodydark2">
                      {detail.criterion_description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatScore(detail.score)}
                    </p>
                    <p className="mt-1 text-xs text-bodydark2">Puntos</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                      Nivel obtenido
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black dark:text-white">
                      {detail.scale_name}
                    </p>
                    <p className="mt-1 text-xs text-bodydark2">
                      Valor: {detail.scale_value}
                    </p>
                  </div>

                  <div className="rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                      Descripción del nivel
                    </p>
                    <p className="mt-1 text-sm text-bodydark2">
                      {detail.scale_description}
                    </p>
                  </div>
                </div>

                {detail.comment && (
                  <div className="mt-4 rounded border border-stroke bg-gray-1 p-3 dark:border-strokedark dark:bg-meta-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                      Comentario del docente
                    </p>
                    <p className="mt-1 text-sm text-bodydark2">{detail.comment}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Rubric Info */}
      {gradeDetail.rubric && (
        <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black dark:text-white">
                Rúbrica utilizada:
              </p>
              <p className="mt-1 text-sm text-bodydark2">{gradeDetail.rubric.title}</p>
              <p className="text-xs text-bodydark2">{gradeDetail.rubric.description}</p>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              {gradeDetail.criteria_details.length} criterios evaluados
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGradeDetailView;
