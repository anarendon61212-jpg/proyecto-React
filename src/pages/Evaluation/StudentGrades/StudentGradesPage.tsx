import React, { useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import useStudentGrades from '../../../hooks/useStudentGrades';
import StudentGradeDetailView from '../../../components/evaluation/StudentGradeDetailView';
import Loader from '../../../common/Loader';
import { generateStudentGradeReport } from '../../../utils/pdf/generateStudentGradeReport';

const StudentGradesPage: React.FC = () => {
  const {
    loading,
    error,
    state,
    loadGradeDetail,
    selectEvaluation,
    clearSelection,
    reload,
  } = useStudentGrades();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvaluations = state.evaluations.filter((evaluation) => {
    const normalizedSearch = searchTerm.toLowerCase();
    return (
      evaluation.name.toLowerCase().includes(normalizedSearch) ||
      evaluation.subject_name.toLowerCase().includes(normalizedSearch) ||
      evaluation.group_name.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleViewDetails = async (evaluationId: string) => {
    selectEvaluation(evaluationId);
    await loadGradeDetail(evaluationId);
  };

  const handleDownloadReport = () => {
    if (state.selectedGradeDetail) {
      try {
        generateStudentGradeReport(state.selectedGradeDetail, state.studentName);
      } catch (error) {
        console.error('Error al generar reporte:', error);
        alert('Error al generar el reporte PDF');
      }
    }
  };

  if (loading && !state.selectedGradeDetail) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumb pageName="Mis Calificaciones" />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Mis Calificaciones
            </h1>
            <p className="mt-1 text-sm text-bodydark2">
              Consulta tus calificaciones detalladas por evaluación
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reload}
              className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
            >
              Refrescar
            </button>
            {state.selectedEvaluationId && (
              <button
                type="button"
                onClick={clearSelection}
                className="rounded border border-stroke px-4 py-2 font-medium text-bodydark1 hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
              >
                Volver a lista
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded border border-danger/30 bg-danger/10 p-4 text-danger">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* View Mode: List or Detail */}
        {!state.selectedGradeDetail ? (
          /* List View */
          <div className="space-y-6">
            {/* Search */}
            <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <input
                type="text"
                placeholder="Buscar por evaluación, asignatura o grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Summary */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <p className="text-sm font-medium text-bodydark2">Total evaluaciones</p>
                <p className="mt-2 text-2xl font-bold text-black dark:text-white">
                  {state.evaluations.length}
                </p>
              </div>
              <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <p className="text-sm font-medium text-bodydark2">Calificadas</p>
                <p className="mt-2 text-2xl font-bold text-success">
                  {state.evaluations.filter((e) => e.has_grade).length}
                </p>
              </div>
              <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <p className="text-sm font-medium text-bodydark2">Pendientes</p>
                <p className="mt-2 text-2xl font-bold text-warning">
                  {state.evaluations.filter((e) => !e.has_grade).length}
                </p>
              </div>
            </div>

            {/* Evaluations List */}
            <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Evaluaciones
              </h3>

              {filteredEvaluations.length === 0 ? (
                <div className="rounded border border-dashed border-bodydark2 bg-white p-12 text-center dark:border-bodydark dark:bg-boxdark">
                  <p className="text-bodydark2">
                    {state.evaluations.length === 0
                      ? 'No tienes evaluaciones registradas'
                      : 'No se encontraron evaluaciones que coincidan con tu búsqueda'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="flex flex-col gap-3 rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-black dark:text-white">
                          {evaluation.name}
                        </h4>
                        <p className="mt-1 text-sm text-bodydark2">
                          {evaluation.subject_name}
                        </p>
                        <p className="text-sm text-bodydark2">{evaluation.group_name}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          {evaluation.has_grade ? (
                            <>
                              <p className="text-lg font-bold text-success">
                                {evaluation.final_score !== null
                                  ? evaluation.final_score.toFixed(2)
                                  : '-'}
                              </p>
                              <p className="text-xs text-bodydark2">Nota final</p>
                            </>
                          ) : (
                            <>
                              <p className="text-lg font-bold text-warning">-</p>
                              <p className="text-xs text-bodydark2">Sin calificar</p>
                            </>
                          )}
                        </div>

                        {evaluation.has_grade ? (
                          <button
                            type="button"
                            onClick={() => handleViewDetails(evaluation.id)}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            Ver detalles
                          </button>
                        ) : (
                          <span className="rounded border border-stroke px-4 py-2 text-sm font-medium text-bodydark2 dark:border-strokedark">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detail View */
          <StudentGradeDetailView
            gradeDetail={state.selectedGradeDetail}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </div>
    </>
  );
};

export default StudentGradesPage;
