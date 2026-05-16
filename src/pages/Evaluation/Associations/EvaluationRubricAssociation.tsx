import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../../components/Breadcrumb';
import RubricReadOnlyPanel from '../../../components/evaluation/RubricReadOnlyPanel';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { RootState } from '../../../store/store';
import {
  EvaluationApi,
  evaluationService,
} from '../../../services/evaluationService';
import { grupoService } from '../../../services/grupoService';
import { asignaturaService } from '../../../services/asignaturaService';
import { inscripcionService, EnrollmentApi } from '../../../services/inscripcionService';
import { matriculaService, SearchStudentApi } from '../../../services/matriculaService';
import {
  CriterionApi,
  RubricApi,
  ScaleApi,
  rubricaService,
} from '../../../services/rubricaService';

type SubjectApi = {
  id: string;
  nombre?: string;
  codigo?: string;
  name?: string;
  code?: string;
};

type GroupApi = {
  id: string;
  nombre?: string;
  name?: string;
  codigo_grupo?: string;
  group_code?: string;
  asignatura_id?: string;
  subject_id?: string;
};

type SubjectAssociationMap = Record<string, string>;

type StudentApi = SearchStudentApi;

const pickText = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const getSubjectName = (subject?: SubjectApi | null) =>
  pickText(subject?.nombre, subject?.name, 'Asignatura sin nombre');

const getSubjectCode = (subject?: SubjectApi | null) =>
  pickText(subject?.codigo, subject?.code, 'Sin codigo');

const getSubjectLabel = (subject?: SubjectApi | null) =>
  `${getSubjectName(subject)} (${getSubjectCode(subject)})`;

const getGroupName = (group?: GroupApi | null) =>
  pickText(group?.nombre, group?.name, 'Grupo sin nombre');

const getGroupCode = (group?: GroupApi | null) =>
  pickText(group?.codigo_grupo, group?.group_code, 'Sin codigo');

const getGroupLabel = (group?: GroupApi | null) =>
  `${getGroupName(group)} (${getGroupCode(group)})`;

const formatWeight = (value?: number | string | null) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return '0';
  }

  if (Number.isInteger(parsed)) {
    return String(parsed);
  }

  return parsed.toFixed(2);
};

const isEnrollmentActive = (enrollment: EnrollmentApi) => {
  const rawStatus = enrollment.status;

  if (typeof rawStatus === 'boolean') {
    return rawStatus;
  }

  if (rawStatus === null || rawStatus === undefined || rawStatus === '') {
    return true;
  }

  const normalized = String(rawStatus).trim().toUpperCase();
  return ['ACTIVE', 'ACTIVO', 'ENROLLED', 'MATRICULADO', 'A', '1'].includes(normalized);
};

const EvaluationRubricAssociation = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const isStudent = user?.role === 'STUDENT';
  const [evaluations, setEvaluations] = useState<EvaluationApi[]>([]);
  const [rubrics, setRubrics] = useState<RubricApi[]>([]);
  const [criteria, setCriteria] = useState<CriterionApi[]>([]);
  const [scales, setScales] = useState<ScaleApi[]>([]);
  const [subjects, setSubjects] = useState<SubjectApi[]>([]);
  const [groups, setGroups] = useState<GroupApi[]>([]);
  const [students, setStudents] = useState<StudentApi[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentApi[]>([]);
  const [selectedRubricByEvaluation, setSelectedRubricByEvaluation] =
    useState<Record<string, string>>({});
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [subjectAssociations] =
    useLocalStorage<SubjectAssociationMap>('rubric_subject_associations', {});

  const [searchTerm, setSearchTerm] = useState('');
  const [onlyWithoutRubric, setOnlyWithoutRubric] = useState(false);
  const [loading, setLoading] = useState(false);
  const [associatingEvaluationId, setAssociatingEvaluationId] = useState<string | null>(
    null,
  );

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const rubricsById = useMemo(
    () => new Map(rubrics.map((rubric) => [rubric.id, rubric])),
    [rubrics],
  );

  const publishedRubrics = useMemo(
    () => rubrics.filter((rubric) => rubric.is_public && !rubric.is_archived),
    [rubrics],
  );

  const publishedRubricIds = useMemo(
    () => new Set(publishedRubrics.map((rubric) => rubric.id)),
    [publishedRubrics],
  );

  const rubricUsageCountById = useMemo(() => {
    const usage = new Map<string, number>();

    evaluations.forEach((evaluation) => {
      if (!evaluation.rubric_id) {
        return;
      }

      usage.set(
        evaluation.rubric_id,
        (usage.get(evaluation.rubric_id) || 0) + 1,
      );
    });

    return usage;
  }, [evaluations]);

  const summary = useMemo(() => {
    const withRubric = evaluations.filter((evaluation) => evaluation.rubric_id).length;

    return {
      total: evaluations.length,
      withRubric,
      withoutRubric: evaluations.length - withRubric,
    };
  }, [evaluations]);

  const currentStudent = useMemo(() => {
    if (!user) {
      return null;
    }

    return (
      students.find((student) => {
        const studentIdentification = pickText(
          student.identification,
          student.cedula,
          student.profile?.identification,
        );

        return student.user_id === user.id || studentIdentification === pickText(user.profile?.identification);
      }) || null
    );
  }, [students, user]);

  const activeEnrollmentGroupIds = useMemo(() => {
    if (!currentStudent) {
      return new Set<string>();
    }

    return new Set(
      enrollments
        .filter((enrollment) => enrollment.student_id === currentStudent.id && isEnrollmentActive(enrollment))
        .map((enrollment) => enrollment.group_id),
    );
  }, [currentStudent, enrollments]);

  const visibleEvaluations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const baseEvaluations = isStudent
      ? evaluations.filter((evaluation) => activeEnrollmentGroupIds.has(evaluation.group_id))
      : evaluations;

    return baseEvaluations
      .filter((evaluation) =>
        isStudent ? true : onlyWithoutRubric ? !evaluation.rubric_id : true,
      )
      .filter((evaluation) => {
        if (isStudent || !normalizedSearch) {
          return true;
        }

        const subject = subjectsById.get(evaluation.subject_id);
        const group = groupsById.get(evaluation.group_id);
        const currentRubric = evaluation.rubric_id
          ? rubricsById.get(evaluation.rubric_id)
          : null;

        const haystack = [
          evaluation.name,
          evaluation.description,
          getSubjectName(subject),
          getSubjectCode(subject),
          getGroupName(group),
          getGroupCode(group),
          currentRubric?.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [
    evaluations,
    activeEnrollmentGroupIds,
    groupsById,
    isStudent,
    onlyWithoutRubric,
    rubricsById,
    searchTerm,
    subjectsById,
  ]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        evaluationsResponse,
        rubricsResponse,
        criteriaResponse,
        scalesResponse,
        subjectsResponse,
        groupsResponse,
        studentsResponse,
        enrollmentsResponse,
      ] =
        await Promise.all([
          evaluationService.getEvaluations(),
          rubricaService.getRubrics(),
          rubricaService.getCriteria(),
          rubricaService.getScales(),
          asignaturaService.getAsignaturas(),
          grupoService.getGrupos(),
          matriculaService.searchEstudiantes(''),
          inscripcionService.getEnrollments(),
        ]);

      const normalizedGroups = (groupsResponse.data?.data ||
        groupsResponse.data ||
        []) as GroupApi[];
      const selectableRubricIds = new Set(
        rubricsResponse
          .filter((rubric) => rubric.is_public && !rubric.is_archived)
          .map((rubric) => rubric.id),
      );

      setEvaluations(evaluationsResponse);
      setRubrics(rubricsResponse);
      setCriteria(criteriaResponse);
      setScales(scalesResponse);
      setSubjects((subjectsResponse || []) as SubjectApi[]);
      setGroups(normalizedGroups);
      setStudents((studentsResponse?.data || []) as StudentApi[]);
      setEnrollments(enrollmentsResponse || []);
      setSelectedRubricByEvaluation(
        Object.fromEntries(
          evaluationsResponse.map((evaluation) => [
            evaluation.id,
            evaluation.rubric_id && selectableRubricIds.has(evaluation.rubric_id)
              ? evaluation.rubric_id
              : '',
          ]),
        ),
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error cargando evaluaciones';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isStudent && !selectedEvaluationId) {
      return;
    }

    if (!selectedEvaluationId && visibleEvaluations.length > 0 && !isStudent) {
      setSelectedEvaluationId(visibleEvaluations[0].id);
      return;
    }

    if (
      selectedEvaluationId &&
      !visibleEvaluations.some((evaluation) => evaluation.id === selectedEvaluationId)
    ) {
      setSelectedEvaluationId(isStudent ? '' : visibleEvaluations[0]?.id || '');
    }
  }, [isStudent, selectedEvaluationId, visibleEvaluations]);

  const selectedEvaluation = useMemo(
    () => visibleEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null,
    [selectedEvaluationId, visibleEvaluations],
  );

  const selectedRubricData = useMemo(() => {
    if (!selectedEvaluation?.rubric_id) {
      return { rubric: null as RubricApi | null, emptyMessage: undefined as string | undefined };
    }

    const raw = rubricsById.get(selectedEvaluation.rubric_id) || null;

    if (isStudent && raw && !raw.is_public) {
      return { rubric: null as RubricApi | null, emptyMessage: 'La rúbrica asociada aún no está publicada.' };
    }

    return { rubric: raw, emptyMessage: undefined as string | undefined };
  }, [rubricsById, selectedEvaluation, isStudent]);

  const selectedRubric = selectedRubricData.rubric;
  const selectedRubricEmptyMessage = selectedRubricData.emptyMessage;

  const selectedCriteria = useMemo(() => {
    if (!selectedRubric) {
      return [];
    }

    return criteria
      .filter((criterion) => criterion.rubric_id === selectedRubric.id)
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [criteria, selectedRubric]);

  const scalesByCriterionId = useMemo(() => {
    const grouped = new Map<string, ScaleApi[]>();

    scales.forEach((scale) => {
      const current = grouped.get(scale.criterion_id) || [];
      current.push(scale);
      grouped.set(scale.criterion_id, current);
    });

    grouped.forEach((criterionScales, criterionId) => {
      grouped.set(
        criterionId,
        criterionScales.sort((left, right) => Number(left.value) - Number(right.value)),
      );
    });

    return grouped;
  }, [scales]);

  const getSelectableRubrics = (evaluation: EvaluationApi) => {
    return [...publishedRubrics].sort((left, right) => {
      const leftMatches =
        Number(subjectAssociations[left.id] === evaluation.subject_id);
      const rightMatches =
        Number(subjectAssociations[right.id] === evaluation.subject_id);

      if (rightMatches !== leftMatches) {
        return rightMatches - leftMatches;
      }

      return left.title.localeCompare(right.title);
    });
  };

  const getRubricLabel = (rubric: RubricApi) => {
    const associatedSubject = subjectsById.get(subjectAssociations[rubric.id] || '');
    const subjectText = associatedSubject
      ? getSubjectLabel(associatedSubject)
      : 'Sin asignatura registrada';
    const usageCount = rubricUsageCountById.get(rubric.id) || 0;
    const usageText =
      usageCount === 0
        ? 'sin evaluaciones asociadas'
        : `${usageCount} evaluacion(es) asociada(s)`;

    return `${rubric.title} - ${subjectText} - ${usageText}`;
  };

  const handleAssociateRubric = async (evaluation: EvaluationApi) => {
    const selectedRubricId = selectedRubricByEvaluation[evaluation.id];

    if (!selectedRubricId) {
      toast.error('Selecciona una rubrica publicada');
      return;
    }

    if (!publishedRubricIds.has(selectedRubricId)) {
      toast.error('Solo puedes asociar rubricas publicadas');
      return;
    }

    if (evaluation.rubric_id === selectedRubricId) {
      toast.error('La evaluacion ya tiene asociada esa rubrica');
      return;
    }

    if (evaluation.rubric_id) {
      const result = await Swal.fire({
        title: 'Actualizar rubrica asociada',
        text: `La evaluacion "${evaluation.name}" cambiara la rubrica actual.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Si, actualizar',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    setAssociatingEvaluationId(evaluation.id);

    try {
      await evaluationService.associateRubric(evaluation.id, selectedRubricId);
      toast.success('Rubrica asociada correctamente');
      await loadData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al asociar la rubrica';
      toast.error(errorMessage);
    } finally {
      setAssociatingEvaluationId(null);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Evaluaciones" />

      <div className="space-y-6">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-6 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                Evaluaciones
              </h3>
              <p className="text-sm text-bodydark2">
                {isStudent
                  ? 'Selecciona una evaluación para consultar su rúbrica en modo lectura.'
                  : 'Centraliza aquí la asociación de rúbrica y el acceso a calificación. Cada evaluación puede tener una sola rúbrica asociada.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Evaluaciones: {summary.total}
              </span>
              <span className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Con rubrica: {summary.withRubric}
              </span>
              <span className="rounded bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                Sin rubrica: {summary.withoutRubric}
              </span>
            </div>
          </div>

          {!isStudent && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Buscar evaluacion
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Busca por evaluacion, asignatura, grupo o rubrica actual"
                  className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white lg:self-end">
                <input
                  type="checkbox"
                  checked={onlyWithoutRubric}
                  onChange={(event) => setOnlyWithoutRubric(event.target.checked)}
                  className="rounded border-stroke"
                />
                Mostrar solo sin rubrica
              </label>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pb-6 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="mb-6 flex flex-col gap-2">
            <h3 className="text-xl font-bold text-black dark:text-white">
              Evaluaciones registradas
            </h3>
            <p className="text-sm text-bodydark2">
              {isStudent
                ? 'La lista funciona como punto de entrada. Selecciona una evaluación para ver la rúbrica asociada.'
                : 'Desde cada fila puedes asociar una rúbrica o entrar a calificar.'}
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-bodydark2">Cargando...</div>
          ) : isStudent && !currentStudent ? (
            <div className="rounded border border-warning/30 bg-warning/10 p-5 text-warning">
              No se encontró un registro de estudiante asociado a tu usuario.
            </div>
          ) : visibleEvaluations.length === 0 ? (
            <div className="py-8 text-center text-bodydark2">
              {isStudent
                ? 'No tienes evaluaciones activas disponibles para consultar.'
                : 'No se encontraron evaluaciones con los filtros actuales.'}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <div className="space-y-4">
                {visibleEvaluations.map((evaluation) => {
                  const subject = subjectsById.get(evaluation.subject_id);
                  const group = groupsById.get(evaluation.group_id);
                  const currentRubric = evaluation.rubric_id
                    ? rubricsById.get(evaluation.rubric_id)
                    : null;
                  const selectableRubrics = getSelectableRubrics(evaluation);
                  const selectedRubricId =
                    selectedRubricByEvaluation[evaluation.id] || '';
                  const selectedRubricOption = selectedRubricId
                    ? rubricsById.get(selectedRubricId)
                    : null;
                  const canGrade = Boolean(evaluation.id && evaluation.rubric_id);
                  const isSelected = selectedEvaluationId === evaluation.id;

                  return (
                    <div
                      key={evaluation.id}
                      className={`rounded border bg-white p-5 dark:bg-boxdark ${
                        isSelected ? 'border-primary shadow-md dark:border-primary' : 'border-stroke dark:border-strokedark'
                      }`}
                    >
                      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-black dark:text-white">
                            {evaluation.name}
                          </h4>
                          <p className="mt-1 text-sm text-bodydark2">
                            {evaluation.description || 'Sin descripcion'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Peso: {formatWeight(evaluation.weight)}%
                          </span>
                          <span className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success">
                            {evaluation.rubric_id ? 'Con rubrica' : 'Sin rubrica'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded border border-stroke bg-gray-1 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                            Asignatura
                          </p>
                          <p className="mt-1 text-sm font-medium text-black dark:text-white">
                            {getSubjectLabel(subject)}
                          </p>
                        </div>

                        <div className="rounded border border-stroke bg-gray-1 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                            Grupo
                          </p>
                          <p className="mt-1 text-sm font-medium text-black dark:text-white">
                            {getGroupLabel(group)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-5 rounded border border-stroke bg-gray-1 px-4 py-3 dark:border-strokedark dark:bg-meta-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                          Rubrica actual
                        </p>
                        <p className="mt-1 text-sm font-medium text-black dark:text-white">
                          {currentRubric ? currentRubric.title : 'Sin rúbrica asociada'}
                        </p>
                        {currentRubric && (
                          <p className="mt-1 text-xs text-bodydark2">
                            {getRubricLabel(currentRubric)}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {evaluation.rubric_id ? (
                          <span className="rounded bg-success/10 px-3 py-1 text-xs font-medium text-success">
                            Con rúbrica asociada
                          </span>
                        ) : (
                          <span className="rounded bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                            Sin rúbrica asociada
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedEvaluationId(evaluation.id)}
                          className="rounded border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white"
                        >
                          {isSelected && !isStudent ? 'Seleccionada' : 'Ver rúbrica'}
                        </button>
                      </div>

                      {!isStudent && (
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                          <div className="rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-bodydark2">
                                  Acciones
                                </p>
                                <p className="text-sm text-bodydark2">
                                  Asocia una rúbrica o entra a calificar desde esta misma evaluación.
                                </p>
                              </div>
                              <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {evaluation.rubric_id ? 'Lista para calificar' : 'Falta rúbrica'}
                              </span>
                            </div>

                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                              Rúbrica publicada a asociar
                            </label>
                            <select
                              value={selectedRubricId}
                              onChange={(event) =>
                                setSelectedRubricByEvaluation((current) => ({
                                  ...current,
                                  [evaluation.id]: event.target.value,
                                }))
                              }
                              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
                            >
                              <option value="">Selecciona una rúbrica publicada...</option>
                              {selectableRubrics.map((rubric) => (
                                <option key={rubric.id} value={rubric.id}>
                                  {getRubricLabel(rubric)}
                                </option>
                              ))}
                            </select>
                            {selectedRubricOption && (
                              <p className="mt-1 text-xs text-bodydark2">
                                Seleccionada: {getRubricLabel(selectedRubricOption)}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleAssociateRubric(evaluation)}
                                disabled={associatingEvaluationId === evaluation.id}
                                className="rounded bg-primary px-5 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                              >
                                {associatingEvaluationId === evaluation.id
                                  ? 'Asociando...'
                                  : evaluation.rubric_id
                                    ? 'Actualizar rúbrica'
                                    : 'Asociar rúbrica'}
                              </button>

                              <button
                                type="button"
                                onClick={() => navigate(`/evaluation/grades/${evaluation.id}`)}
                                disabled={!canGrade}
                                className="rounded border border-success px-5 py-3 font-medium text-success hover:bg-success hover:text-white disabled:cursor-not-allowed disabled:border-stroke disabled:text-bodydark2 disabled:hover:bg-transparent disabled:hover:text-bodydark2"
                              >
                                Calificar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                      Detalle de rúbrica
                    </h4>
                    <p className="text-sm text-bodydark2">
                      Vista de solo lectura desde la evaluación seleccionada.
                    </p>
                  </div>
                  <span className="rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Solo lectura
                  </span>
                </div>

                {selectedEvaluation ? (
                  <RubricReadOnlyPanel
                    evaluationName={selectedEvaluation.name}
                    subjectLabel={getSubjectLabel(subjectsById.get(selectedEvaluation.subject_id))}
                    groupLabel={getGroupLabel(groupsById.get(selectedEvaluation.group_id))}
                    rubric={selectedRubric}
                    criteria={selectedCriteria}
                    scalesByCriterionId={scalesByCriterionId}
                    emptyMessage={selectedRubricEmptyMessage}
                  />
                ) : (
                  <div className="rounded border border-dashed border-stroke p-6 text-bodydark2 dark:border-strokedark">
                    Selecciona una evaluación para ver su rúbrica.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EvaluationRubricAssociation;
