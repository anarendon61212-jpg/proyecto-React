import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFinalGrades from '../../hooks/useFinalGrades';
import StudentFinalGradeTable from '../../components/finalGrades/StudentFinalGradeTable';
import FinalGradeSummary from '../../components/finalGrades/FinalGradeSummary';
import ConfirmFinalGradesModal from '../../components/finalGrades/ConfirmFinalGradesModal';
import DownloadPdfButton from '../../components/finalGrades/DownloadPdfButton';
import Loader from '../../common/Loader';

const FinalGradesByGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupId: routeGroupId } = useParams<{ groupId?: string }>();
  const groupId = routeGroupId?.trim() || '';

  const {
    loading,
    error,
    finalGradesState,
    submitting,
    confirmFinalGrades,
    reload,
    studentsByStatus,
  } = useFinalGrades(groupId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const completeEnrollmentIds = useMemo(() => {
    if (!finalGradesState) return [];
    return finalGradesState.students
      .filter((student) => student.status === 'Completo')
      .map((student) => student.enrollment_id);
  }, [finalGradesState]);

  const handleRecordFinalGrades = async () => {
    try {
      const result = await confirmFinalGrades(completeEnrollmentIds);

      setShowConfirmModal(false);
      toast.success(
        `Consolidacion oficial completada. Fecha: ${new Date(result.response.finalized_at).toLocaleString()}`,
      );

      reload();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Error al confirmar notas';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!groupId) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
          La ruta es inválida: falta el identificador del grupo.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded border border-danger/30 bg-danger/10 p-5 text-danger">
          <p className="font-medium">Error al cargar datos:</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={reload}
            className="mt-3 rounded bg-danger px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!finalGradesState) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
          No se encontraron datos para este grupo.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Notas finales del semestre
          </h1>
          <p className="mt-1 text-sm text-bodydark2">
            Grupo: <span className="font-medium">{finalGradesState.groupName}</span>
          </p>
          <p className="mt-1 text-sm text-bodydark2">
            Asignatura: <span className="font-medium">{finalGradesState.subjectName}</span>
          </p>
          <p className="mt-1 text-sm text-bodydark2">
            Semestre: <span className="font-medium">{finalGradesState.semesterName}</span>
          </p>
          {finalGradesState.isFinalized && (
            <span className="mt-2 inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-xs font-medium text-success">
              Consolidado oficialmente
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border border-stroke px-4 py-2 font-medium text-bodydark1 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={reload}
            className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <FinalGradeSummary
        finalGradesState={finalGradesState}
        pendingCount={studentsByStatus.pendiente}
        completeCount={studentsByStatus.completo}
        consolidatedCount={studentsByStatus.consolidado}
      />

      {!finalGradesState.semesterActive && (
        <div className="rounded border border-danger/30 bg-danger/10 p-4 text-danger">
          No se puede consolidar: el semestre del grupo no esta activo.
        </div>
      )}

      {finalGradesState.validationErrors.length > 0 && !finalGradesState.isFinalized && (
        <div className="rounded border border-warning/30 bg-warning/10 p-4 text-warning">
          <p className="font-medium">Validaciones pendientes antes de consolidar:</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {finalGradesState.validationErrors.map((validationError) => (
              <li key={validationError}>{validationError}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Students Table */}
      <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-black dark:text-white">
            Consolidado por estudiante
          </h2>
          <div className="flex flex-wrap gap-2">
            <DownloadPdfButton
              finalGradesState={finalGradesState}
              disabled={!finalGradesState.isFinalized}
            />
          </div>
        </div>

        <StudentFinalGradeTable
          students={finalGradesState.students}
          evaluations={finalGradesState.evaluations}
        />
      </div>

      {/* Action Buttons */}
      {finalGradesState.students.length > 0 && !finalGradesState.isFinalized && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!finalGradesState.canFinalize || submitting}
            className="flex items-center gap-2 rounded bg-success px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Confirmar consolidacion oficial
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmFinalGradesModal
        isOpen={showConfirmModal}
        totalStudents={finalGradesState.students.length}
        semesterName={finalGradesState.semesterName}
        onConfirm={handleRecordFinalGrades}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={submitting}
      />

      {/* Info Message */}
      {finalGradesState.students.length === 0 && (
        <div className="rounded border border-dashed border-bodydark2 bg-white p-6 text-center dark:border-bodydark dark:bg-boxdark">
          <p className="text-bodydark2">
            Este grupo no tiene estudiantes inscritos.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinalGradesByGroupPage;
