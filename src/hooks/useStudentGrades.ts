import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { gradeService } from '../services/gradeService';
import type { GradeApi } from '../types/grade';
import { evaluationService, type EvaluationApi } from '../services/evaluationService';
import { rubricaService, type RubricApi, type CriterionApi, type ScaleApi } from '../services/rubricaService';
import { grupoService } from '../services/grupoService';
import { asignaturaService } from '../services/asignaturaService';
import { inscripcionService, type EnrollmentApi } from '../services/inscripcionService';
import { matriculaService, type SearchStudentApi } from '../services/matriculaService';

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

export type StudentGradeDetail = {
  evaluation_id: string;
  evaluation_name: string;
  subject_name: string;
  group_name: string;
  final_score: number | null;
  status: string;
  observations?: string;
  rubric: RubricApi | null;
  criteria_details: Array<{
    criterion_id: string;
    criterion_name: string;
    criterion_description: string;
    criterion_weight: number;
    scale_name: string;
    scale_value: number;
    scale_description: string;
    score: number;
    comment?: string;
  }>;
};

type StudentGradesState = {
  studentId: string;
  studentName: string;
  evaluations: Array<{
    id: string;
    name: string;
    subject_name: string;
    group_name: string;
    has_grade: boolean;
    final_score: number | null;
    status: string;
  }>;
  selectedEvaluationId: string | null;
  selectedGradeDetail: StudentGradeDetail | null;
};

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

const getGroupName = (group?: GroupApi | null) =>
  pickText(group?.nombre, group?.name, 'Grupo sin nombre');

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

export const useStudentGrades = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StudentGradesState>({
    studentId: '',
    studentName: '',
    evaluations: [],
    selectedEvaluationId: null,
    selectedGradeDetail: null,
  });

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'STUDENT') {
      setError('Acceso no autorizado: esta funcionalidad es solo para estudiantes');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener estudiante actual
      const studentsResponse = await matriculaService.searchEstudiantes('');
      const studentsList = (studentsResponse?.data || studentsResponse) as SearchStudentApi[];
      
      const currentStudent = studentsList.find((student) => {
        const studentIdentification = pickText(
          student.identification,
          student.cedula,
          student.profile?.identification,
        );
        return student.user_id === user.id || studentIdentification === pickText(user.profile?.identification);
      });

      if (!currentStudent) {
        setError('No se encontró el registro de estudiante asociado a tu usuario');
        setLoading(false);
        return;
      }

      const studentName = pickText(
        currentStudent.nombre,
        currentStudent.first_name,
        'Estudiante sin nombre'
      );

      // Obtener inscripciones activas
      const enrollments = await inscripcionService.getEnrollments();
      const activeEnrollments = enrollments.filter(
        (enrollment: EnrollmentApi) => 
          enrollment.student_id === currentStudent.id && isEnrollmentActive(enrollment)
      );

      if (activeEnrollments.length === 0) {
        setState({
          studentId: currentStudent.id,
          studentName,
          evaluations: [],
          selectedEvaluationId: null,
          selectedGradeDetail: null,
        });
        setLoading(false);
        return;
      }

      // Obtener grupos y asignaturas
      const groupIds = activeEnrollments.map((e) => e.group_id);
      const groupsResponse = await grupoService.getGrupos();
      const groupsData = (groupsResponse?.data?.data || groupsResponse?.data || []) as GroupApi[];
      const studentGroups = groupsData.filter((g) => groupIds.includes(g.id));

      const subjectIds = studentGroups.map((g) => g.asignatura_id || g.subject_id).filter(Boolean);
      const subjectsResponse = await asignaturaService.getAsignaturas();
      const subjectsData = (subjectsResponse || []) as SubjectApi[];
      const subjectsById = new Map(subjectsData.map((s) => [s.id, s]));
      const groupsById = new Map(studentGroups.map((g) => [g.id, g]));

      // Obtener evaluaciones de los grupos
      const evaluationsResponse = await evaluationService.getEvaluations();
      const studentEvaluations = evaluationsResponse.filter((evaluation: EvaluationApi) =>
        groupIds.includes(evaluation.group_id)
      );

      // Obtener calificaciones del estudiante
      const gradesPromises = studentEvaluations.map(async (evaluation: EvaluationApi) => {
        try {
          const grades = await gradeService.getEvaluationGrades(evaluation.id);
          const studentGrade = grades.find(
            (g: GradeApi) => g.enrollment_id && activeEnrollments.some(
              (ae: EnrollmentApi) => ae.id === g.enrollment_id
            )
          );
          return { evaluation, grade: studentGrade || null };
        } catch {
          return { evaluation, grade: null };
        }
      });

      const gradesResults = await Promise.all(gradesPromises);

      // Construir lista de evaluaciones con calificaciones
      const evaluationsList = gradesResults.map(({ evaluation, grade }) => {
        const group = groupsById.get(evaluation.group_id);
        const subject = group ? subjectsById.get(group.asignatura_id || group.subject_id || '') : null;

        return {
          id: evaluation.id,
          name: evaluation.name,
          subject_name: subject ? getSubjectName(subject) : 'Asignatura no disponible',
          group_name: group ? getGroupName(group) : 'Grupo no disponible',
          has_grade: grade !== null && grade.status === 'SENT',
          final_score: grade?.final_score || null,
          status: grade?.status || 'NOT_GRADED',
        };
      });

      setState({
        studentId: currentStudent.id,
        studentName,
        evaluations: evaluationsList,
        selectedEvaluationId: null,
        selectedGradeDetail: null,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar calificaciones';
      setError(errorMessage);
      console.error('Error en useStudentGrades:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadGradeDetail = useCallback(async (evaluationId: string) => {
    if (!user || user.role !== 'STUDENT') {
      setError('Acceso no autorizado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener evaluación
      const evaluations = await evaluationService.getEvaluations();
      const evaluation = evaluations.find((e: EvaluationApi) => e.id === evaluationId);
      
      if (!evaluation) {
        setError('Evaluación no encontrada');
        setLoading(false);
        return;
      }

      // Obtener grupo y asignatura
      const groupResponse = await grupoService.getGrupoById(evaluation.group_id);
      const group = groupResponse?.data?.data || groupResponse?.data;
      const subjectId = group?.asignatura_id || group?.subject_id;
      const subject = subjectId ? await asignaturaService.getAsignaturaById(subjectId) : null;

      // Obtener inscripción del estudiante
      const enrollments = await inscripcionService.getEnrollments();
      const studentsResponse = await matriculaService.searchEstudiantes('');
      const studentsList = (studentsResponse?.data || studentsResponse) as SearchStudentApi[];
      
      const currentStudent = studentsList.find((student) => {
        const studentIdentification = pickText(
          student.identification,
          student.cedula,
          student.profile?.identification,
        );
        return student.user_id === user.id || studentIdentification === pickText(user.profile?.identification);
      });

      if (!currentStudent) {
        setError('Estudiante no encontrado');
        setLoading(false);
        return;
      }

      const studentEnrollment = enrollments.find(
        (e: EnrollmentApi) => e.student_id === currentStudent.id && e.group_id === evaluation.group_id
      );

      if (!studentEnrollment) {
        setError('No estás inscrito en esta evaluación');
        setLoading(false);
        return;
      }

      // Obtener calificación
      const grades = await gradeService.getEvaluationGrades(evaluationId);
      const grade = grades.find((g: GradeApi) => g.enrollment_id === studentEnrollment.id);

      if (!grade || grade.status !== 'SENT') {
        setError('Esta calificación aún no ha sido oficialmente enviada por el docente');
        setLoading(false);
        return;
      }

      // Obtener rúbrica, criterios y escalas
      const rubric = evaluation.rubric_id 
        ? (await rubricaService.getRubrics()).find((r: RubricApi) => r.id === evaluation.rubric_id) || null
        : null;

      let criteriaDetails: StudentGradeDetail['criteria_details'] = [];

      if (rubric && grade.details) {
        const criteria = await rubricaService.getCriteria();
        const scales = await rubricaService.getScales();
        
        const rubricCriteria = criteria.filter((c: CriterionApi) => c.rubric_id === rubric.id);
        const rubricScales = scales.filter((s: ScaleApi) => rubricCriteria.some((c: CriterionApi) => c.id === s.criterion_id));
        const scalesById = new Map(rubricScales.map((s: ScaleApi) => [s.id, s]));

        criteriaDetails = rubricCriteria.map((criterion: CriterionApi) => {
          const detail = grade.details?.find((d: any) => d.scale_id && scalesById.has(d.scale_id));
          const scale = detail ? scalesById.get(detail.scale_id) : null;

          return {
            criterion_id: criterion.id,
            criterion_name: criterion.name,
            criterion_description: criterion.description,
            criterion_weight: criterion.weight,
            scale_name: scale?.name || 'Sin nivel',
            scale_value: scale?.value || 0,
            scale_description: scale?.description || '',
            score: detail?.score || 0,
            comment: detail?.comment || '',
          };
        });
      }

      const gradeDetail: StudentGradeDetail = {
        evaluation_id: evaluation.id,
        evaluation_name: evaluation.name,
        subject_name: subject ? getSubjectName(subject as SubjectApi) : 'Asignatura no disponible',
        group_name: group ? getGroupName(group as GroupApi) : 'Grupo no disponible',
        final_score: grade.final_score || null,
        status: grade.status,
        observations: grade.observations,
        rubric,
        criteria_details: criteriaDetails,
      };

      setState((prev) => ({
        ...prev,
        selectedEvaluationId: evaluationId,
        selectedGradeDetail: gradeDetail,
      }));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar detalle de calificación';
      setError(errorMessage);
      console.error('Error en loadGradeDetail:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const selectEvaluation = useCallback((evaluationId: string) => {
    setState((prev) => ({
      ...prev,
      selectedEvaluationId: evaluationId,
      selectedGradeDetail: null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedEvaluationId: null,
      selectedGradeDetail: null,
    }));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    error,
    state,
    loadGradeDetail,
    selectEvaluation,
    clearSelection,
    reload: loadData,
  };
};

export default useStudentGrades;
