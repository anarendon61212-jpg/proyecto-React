import React from 'react';

type Props = {
  evaluationName?: string;
  completeness: number;
  totalStudents?: number;
  totalCriteria?: number;
  sentCount?: number;
  draftCount?: number;
};

const GradeSummary: React.FC<Props> = ({
  evaluationName,
  completeness,
  totalStudents = 0,
  totalCriteria = 0,
  sentCount = 0,
  draftCount = 0,
}) => {
  return (
    <div className="sticky top-6 rounded border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">Resumen</h4>
      <p className="mb-3 text-sm text-bodydark2">Evaluación: {evaluationName || 'N/A'}</p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded bg-gray-1 p-3 dark:bg-meta-4">
          <p className="text-xs text-bodydark2">Estudiantes</p>
          <p className="text-lg font-semibold text-black dark:text-white">{totalStudents}</p>
        </div>
        <div className="rounded bg-gray-1 p-3 dark:bg-meta-4">
          <p className="text-xs text-bodydark2">Criterios</p>
          <p className="text-lg font-semibold text-black dark:text-white">{totalCriteria}</p>
        </div>
        <div className="rounded bg-success/10 p-3">
          <p className="text-xs text-success">Enviados</p>
          <p className="text-lg font-semibold text-success">{sentCount}</p>
        </div>
        <div className="rounded bg-warning/10 p-3">
          <p className="text-xs text-warning">Borradores</p>
          <p className="text-lg font-semibold text-warning">{draftCount}</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-black dark:text-white">Progreso de completitud</label>
        <div className="h-3 w-full overflow-hidden rounded bg-gray-100">
          <div style={{ width: `${completeness}%` }} className="h-3 bg-primary" />
        </div>
        <p className="mt-2 text-xs text-bodydark2">{completeness}% completado</p>
      </div>

      <div className="text-sm text-bodydark2">
        <p>Guardar como borrador permite seguir editando.</p>
        <p>Enviar guardará la calificación final y notificará al estudiante.</p>
      </div>
    </div>
  );
};

export default GradeSummary;
