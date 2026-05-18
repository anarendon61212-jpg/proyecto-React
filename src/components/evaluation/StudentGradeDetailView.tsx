import React from 'react';
import type { StudentGradeDetail } from '../../hooks/useStudentGrades';

interface StudentGradeDetailViewProps {
  gradeDetail: StudentGradeDetail;
  onDownloadReport: () => void;
}

const StudentGradeDetailView: React.FC<StudentGradeDetailViewProps> = ({
  gradeDetail,
  onDownloadReport,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white">
            {gradeDetail.evaluation_name}
          </h2>
          <p className="mt-1 text-sm text-bodydark2">
            {gradeDetail.subject_name} - {gradeDetail.group_name}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadReport}
          className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
        >
          Descargar Reporte PDF
        </button>
      </div>

      {/* Final Score */}
      <div className="rounded border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Nota Final
        </h3>
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 px-6 py-3">
            <span className="text-3xl font-bold text-primary">
              {gradeDetail.final_score !== null
                ? gradeDetail.final_score.toFixed(2)
                : '-'}
            </span>
          </div>
          <div>
            <p className="text-sm text-bodydark2">Estado</p>
            <p className="font-medium text-black dark:text-white">
              {gradeDetail.status}
            </p>
          </div>
        </div>
      </div>

      {/* Observations */}
      {gradeDetail.observations && (
        <div className="rounded border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
            Observaciones
          </h3>
          <p className="text-bodydark1">{gradeDetail.observations}</p>
        </div>
      )}

      {/* Criteria Details */}
      {gradeDetail.rubric && (
        <div className="rounded border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
            Detalles por Criterio
          </h3>
          <div className="space-y-4">
            {gradeDetail.criteria_details.map((detail) => (
              <div
                key={detail.criterion_id}
                className="rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-black dark:text-white">
                      {detail.criterion_name}
                    </h4>
                    <p className="mt-1 text-sm text-bodydark2">
                      {detail.criterion_description}
                    </p>
                    <p className="mt-2 text-xs text-bodydark2">
                      Peso: {detail.criterion_weight}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {detail.score.toFixed(2)}
                    </p>
                    <p className="text-xs text-bodydark2">Puntaje</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-stroke pt-4 dark:border-strokedark sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-bodydark2">
                      Nivel Obtenido
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      {detail.scale_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-bodydark2">
                      Valor de Escala
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      {detail.scale_value}
                    </p>
                  </div>
                </div>

                {detail.comment && (
                  <div className="mt-4 rounded bg-white p-3 dark:bg-boxdark">
                    <p className="text-xs font-medium text-bodydark2">
                      Comentario del Docente
                    </p>
                    <p className="mt-1 text-sm text-bodydark1">
                      {detail.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!gradeDetail.rubric && (
        <div className="rounded border border-warning/30 bg-warning/10 p-6 text-warning">
          <p>No hay rúbrica asociada a esta evaluación.</p>
        </div>
      )}
    </div>
  );
};

export default StudentGradeDetailView;
