import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGrades from '../../../hooks/useGrades';
import StudentGradeCard from '../../../components/evaluation/StudentGradeCard';
import GradeSummary from '../../../components/evaluation/GradeSummary';

const GradeStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { evaluationId: routeEvaluationId } = useParams<{ evaluationId?: string }>();
  const evaluationId = routeEvaluationId?.trim() || '';

  const {
    loading,
    loadingGrades,
    evaluation,
    students,
    completeness,
    savingMap,
    updateSelectedScale,
    updateComment,
    updateObservations,
    saveDraft,
    submitGrade,
    groupFinalized,
    groupFinalizedAt,
    reload,
  } = useGrades(evaluationId);

  const [missingByEnrollment, setMissingByEnrollment] = React.useState<Record<string, Set<string>>>({});

  const totalCriteria = React.useMemo(
    () => students.reduce((sum, student) => sum + student.criteria.length, 0),
    [students],
  );

  const sentCount = React.useMemo(
    () => students.filter((student) => student.status === 'SENT').length,
    [students],
  );

  const draftCount = React.useMemo(
    () => students.filter((student) => student.status === 'DRAFT').length,
    [students],
  );

  const handleSaveDraft = async (enrollmentId: string) => {
    try {
      await saveDraft(enrollmentId);
      toast.success('Borrador guardado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Error al guardar');
    }
  };

  const handleSubmit = async (enrollmentId: string) => {
    try {
      await submitGrade(enrollmentId);
      // clear missing markers on success
      setMissingByEnrollment((m) => {
        const copy = { ...m };
        delete copy[enrollmentId];
        return copy;
      });
      toast.success('Calificación enviada');
    } catch (error: any) {
      // handle structured missing error from hook
      if (error && error.type === 'MISSING' && Array.isArray(error.missing)) {
        setMissingByEnrollment((m) => ({ ...m, [enrollmentId]: new Set(error.missing) }));
        toast.error('Faltan criterios por calificar');
        return;
      }

      toast.error(error.response?.data?.message || error.message || 'Error al enviar');
    }
  };

  if (loading || loadingGrades) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-gray-200 dark:bg-meta-4" />
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-36 animate-pulse rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark" />
            <div className="h-36 animate-pulse rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark" />
            <div className="h-36 animate-pulse rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark" />
          </div>
          <div className="h-80 animate-pulse rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark" />
        </div>
      </div>
    );
  }

  if (!evaluationId) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
          La ruta es inválida: falta el identificador de evaluación.
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
          No se encontró la evaluación solicitada o no tiene una rúbrica asociada.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white">Calificar estudiantes</h2>
          <p className="text-sm text-bodydark2">Selecciona una escala por criterio y agrega comentarios opcionales.</p>
          {groupFinalized && (
            <span className="mt-2 inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-xs font-medium text-success">
              Consolidado oficialmente{groupFinalizedAt ? `: ${new Date(groupFinalizedAt).toLocaleString()}` : ''}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-stroke px-3 py-2 text-sm hover:bg-gray-1 dark:hover:bg-meta-4"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={() => reload()}
            className="rounded bg-primary px-3 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Refrescar
          </button>
        </div>
      </div>

      {groupFinalized && (
        <div className="rounded border border-warning/30 bg-warning/10 p-4 text-warning">
          Edicion bloqueada: este grupo ya fue consolidado oficialmente en notas finales.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {students.length === 0 ? (
              <div className="col-span-full rounded border border-dashed border-stroke bg-white p-6 text-center text-bodydark2 dark:border-strokedark dark:bg-boxdark">
                No hay estudiantes inscritos.
              </div>
            ) : (
              students.map((s) => (
                <StudentGradeCard
                  key={s.enrollment_id}
                  data={s}
                  onChangeScale={(enId, criterionId, scaleId) => updateSelectedScale(enId, criterionId, scaleId)}
                  onChangeComment={(enId, criterionId, comment) => updateComment(enId, criterionId, comment)}
                  onChangeObservations={(enId, observations) => updateObservations(enId, observations)}
                  onSaveDraft={handleSaveDraft}
                  onSubmit={handleSubmit}
                  saving={!!savingMap[s.enrollment_id]}
                  missingCriteria={missingByEnrollment[s.enrollment_id] || null}
                />
              ))
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <GradeSummary
            evaluationName={evaluation?.name || evaluation?.title}
            completeness={completeness}
            totalStudents={students.length}
            totalCriteria={totalCriteria}
            sentCount={sentCount}
            draftCount={draftCount}
          />
        </aside>
      </div>
    </div>
  );
};

export default GradeStudentsPage;
