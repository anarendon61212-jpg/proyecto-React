import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  finalGradeService,
  type FinalizeGroupResponse,
  type GradeForFinalGrade,
} from '../services/finalGradeService';
import { inscripcionService } from '../services/inscripcionService';
import { matriculaService } from '../services/matriculaService';
import { grupoService } from '../services/grupoService';
import { asignaturaService } from '../services/asignaturaService';
import { semesterService } from '../services/semesterService';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface StudentFinalGrade {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  evaluations: Array<{
    evaluation_id: string;
    name: string;
    weight: number;
    final_score: number | null;
    grade_status: string | null;
  }>;
  final_semester_score: number;
  status: 'Pendiente' | 'Completo' | 'Consolidado';
}

export interface FinalGradesState {
  groupId: string;
  groupName: string;
  subjectName: string;
  semesterName: string;
  semesterActive: boolean;
  isFinalized: boolean;
  finalizedAt: string | null;
  locked: boolean;
  evaluations: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
  students: StudentFinalGrade[];
  averageFinalGrade: number;
  canFinalize: boolean;
  validationErrors: string[];
  missingByEvaluation: Record<string, number>;
  nonSubmittedByEvaluation: Record<string, number>;
}

export interface ConfirmFinalGradesResult {
  response: FinalizeGroupResponse;
}

const normalizeStatus = (status?: string | null) => (status || '').trim().toUpperCase();

const isEnrollmentActive = (enrollment: any) => {
  const raw = enrollment?.status;
  if (typeof raw === 'boolean') {
    return raw;
  }
  if (raw === null || raw === undefined || raw === '') {
    return true;
  }
  const normalized = String(raw).trim().toUpperCase();
  return ['ACTIVE', 'ACTIVO', 'ENROLLED', 'MATRICULADO'].includes(normalized);
};

const getGradeByEnrollment = (
  grades: GradeForFinalGrade[],
  enrollmentId: string,
): GradeForFinalGrade | undefined => grades.find((grade) => grade.enrollment_id === enrollmentId);

export const useFinalGrades = (groupId?: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalGradesState, setFinalGradesState] = useState<FinalGradesState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!groupId) {
      setFinalGradesState(null);
      setLoading(false);
      return;
    }

    if (!UUID_REGEX.test(groupId)) {
      setFinalGradesState(null);
      setError('UUID de grupo invalido');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupResponse = await grupoService.getGrupoById(groupId);
      const group = groupResponse?.data?.data || groupResponse?.data;
      const groupName = group?.nombre || group?.name || 'Grupo sin nombre';

      const subjectId = group?.asignatura_id || group?.subject_id;
      const semesterId = group?.semestre_id || group?.semester_id;

      const [evaluations, allEnrollments, studentsResponse, statusResponse] = await Promise.all([
        finalGradeService.getGroupEvaluations(groupId),
        inscripcionService.getEnrollments(),
        matriculaService.searchEstudiantes(''),
        finalGradeService.getFinalizationStatus(groupId),
      ]);

      const [subject, semester] = await Promise.all([
        subjectId ? asignaturaService.getAsignaturaById(subjectId) : Promise.resolve(null),
        semesterId ? semesterService.getSemesterById(semesterId) : Promise.resolve(null),
      ]);

      const subjectName =
        subject?.nombre || subject?.name || subject?.code || 'Asignatura no disponible';

      const semesterName =
        semester?.name || semester?.code || group?.semestre_nombre || 'Semestre no disponible';

      const semesterActive =
        typeof semester?.is_active === 'boolean'
          ? semester.is_active
          : Boolean(group?.semester_status ?? group?.semestre_activo ?? false);

      const enrollments = (allEnrollments || []).filter((en: any) => en.group_id === groupId);
      const activeEnrollments = enrollments.filter(isEnrollmentActive);

      const studentsList = (studentsResponse?.data || studentsResponse) || [];
      const studentsById = new Map<string, any>();
      if (Array.isArray(studentsList)) {
        studentsList.forEach((s: any) => {
          studentsById.set(s.id, s);
        });
      }

      const gradeResponses = await Promise.all(
        evaluations.map(async (evaluation) => ({
          evaluation,
          grades: await finalGradeService.getEvaluationGrades(evaluation.id),
        })),
      );

      const gradesByEvaluation = new Map<string, GradeForFinalGrade[]>();
      gradeResponses.forEach(({ evaluation, grades }) => {
        gradesByEvaluation.set(evaluation.id, grades);
      });

      const missingByEvaluation: Record<string, number> = {};
      const nonSubmittedByEvaluation: Record<string, number> = {};

      evaluations.forEach((evaluation) => {
        const grades = gradesByEvaluation.get(evaluation.id) || [];
        const missingCount = activeEnrollments.filter(
          (enrollment: any) => !getGradeByEnrollment(grades, enrollment.id),
        ).length;
        missingByEvaluation[evaluation.id] = missingCount;

        const nonSubmittedCount = activeEnrollments.filter((enrollment: any) => {
          const grade = getGradeByEnrollment(grades, enrollment.id);
          if (!grade) {
            return true;
          }
          return !['SUBMITTED', 'SENT'].includes(normalizeStatus(grade.status));
        }).length;
        nonSubmittedByEvaluation[evaluation.id] = nonSubmittedCount;
      });

      const studentsFinalGrades: StudentFinalGrade[] = activeEnrollments.map((enrollment: any) => {
        const student = studentsById.get(enrollment.student_id);
        const studentName =
          student?.nombre && student?.apellido
            ? `${student.nombre} ${student.apellido}`
            : student?.first_name && student?.last_name
              ? `${student.first_name} ${student.last_name}`
              : student?.first_name || 'Sin nombre';

        const evaluationGrades = evaluations.map((evaluation: any) => {
          const grades = gradesByEvaluation.get(evaluation.id) || [];
          const studentGrade = getGradeByEnrollment(grades, enrollment.id);

          const rawScore = studentGrade?.final_score;
          const finalScore = typeof rawScore === 'number' ? rawScore : null;

          return {
            evaluation_id: evaluation.id,
            name: evaluation.name,
            weight: evaluation.weight || 0,
            final_score: finalScore,
            grade_status: studentGrade?.status || null,
          };
        });

        const isComplete = evaluationGrades.every(
          (eg) =>
            typeof eg.final_score === 'number' &&
            ['SUBMITTED', 'SENT'].includes(normalizeStatus(eg.grade_status)),
        );

        const finalGrade = finalGradeService.calculateFinalGrade(evaluationGrades);

        const status: StudentFinalGrade['status'] = statusResponse.finalized
          ? 'Consolidado'
          : isComplete
            ? 'Completo'
            : 'Pendiente';

        return {
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          student_name: studentName,
          evaluations: evaluationGrades,
          final_semester_score: finalGrade,
          status,
        };
      });

      const averageFinalGrade =
        studentsFinalGrades.length > 0
          ? Math.round(
              (studentsFinalGrades.reduce((sum, s) => sum + s.final_semester_score, 0) /
                studentsFinalGrades.length) *
                100
            ) / 100
          : 0;

      const hasMissingGrades = Object.values(missingByEvaluation).some((count) => count > 0);
      const hasNonSubmitted = Object.values(nonSubmittedByEvaluation).some((count) => count > 0);
      const validationErrors: string[] = [];

      if (!semesterActive) {
        validationErrors.push('El semestre del grupo no esta activo.');
      }
      if (hasMissingGrades) {
        validationErrors.push('Existen evaluaciones sin grades para todas las inscripciones activas.');
      }
      if (hasNonSubmitted) {
        validationErrors.push('Todas las grades deben estar en estado submitted/sent antes de consolidar.');
      }
      if (evaluations.length === 0) {
        validationErrors.push('El grupo no tiene evaluaciones registradas.');
      }
      if (activeEnrollments.length === 0) {
        validationErrors.push('El grupo no tiene inscripciones activas.');
      }

      const canFinalize = !statusResponse.finalized && validationErrors.length === 0;

      setFinalGradesState({
        groupId,
        groupName,
        subjectName,
        semesterName,
        semesterActive,
        isFinalized: !!statusResponse.finalized,
        finalizedAt: statusResponse.finalized_at || null,
        locked: !!statusResponse.locked,
        evaluations: evaluations.map((evaluation) => ({
          id: evaluation.id,
          name: evaluation.name,
          weight: Number(evaluation.weight || 0),
        })),
        students: studentsFinalGrades,
        averageFinalGrade,
        canFinalize,
        validationErrors,
        missingByEvaluation,
        nonSubmittedByEvaluation,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Error al cargar datos';
      setError(errorMessage);
      console.error('Error en useFinalGrades:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const confirmFinalGrades = useCallback(
    async (enrollmentIds: string[]) => {
      if (!finalGradesState) throw new Error('Estado no cargado');

      setSubmitting(true);
      try {
        if (enrollmentIds.length === 0) {
          throw new Error('Selecciona al menos un estudiante para confirmar.');
        }

        const selectedSet = new Set(enrollmentIds);
        const invalidSelection = finalGradesState.students.some(
          (student) => selectedSet.has(student.enrollment_id) && student.status !== 'Completo',
        );

        if (invalidSelection) {
          throw new Error('Solo se pueden consolidar estudiantes con estado Completo.');
        }

        if (!finalGradesState.canFinalize) {
          throw new Error('El grupo no cumple validaciones para consolidacion oficial.');
        }

        const response = await finalGradeService.finalizeGroup(finalGradesState.groupId);
        return { response };
      } finally {
        setSubmitting(false);
      }
    },
    [finalGradesState]
  );

  const reload = useCallback(() => {
    loadData();
  }, [loadData]);

  const studentsByStatus = useMemo(() => {
    const result = {
      pendiente: 0,
      completo: 0,
      consolidado: 0,
    };

    (finalGradesState?.students || []).forEach((student) => {
      if (student.status === 'Consolidado') result.consolidado += 1;
      else if (student.status === 'Completo') result.completo += 1;
      else result.pendiente += 1;
    });

    return result;
  }, [finalGradesState]);

  return {
    loading,
    error,
    finalGradesState,
    submitting,
    confirmFinalGrades,
    reload,
    studentsByStatus,
  };
};

export default useFinalGrades;
