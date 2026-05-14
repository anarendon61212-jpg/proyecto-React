import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { evaluationService } from '../services/evaluationService';
import { rubricaService } from '../services/rubricaService';
import { inscripcionService } from '../services/inscripcionService';
import { matriculaService } from '../services/matriculaService';
import { gradeService } from '../services/gradeService';
import type {
  StudentGradeState,
  CriterionOption,
  GradeDetailPayload,
} from '../types/grade';

export const useGrades = (providedEvaluationId?: string) => {
  const params = useParams();
  const evaluationId = providedEvaluationId || (params as any).evaluationId;

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [students, setStudents] = useState<StudentGradeState[]>([]);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Load evaluations and pick the requested one
      const evaluations = await evaluationService.getEvaluations();
      const picked = evaluationId
        ? evaluations.find((e) => e.id === evaluationId)
        : null;

      if (!picked) {
        setEvaluation(null);
        setStudents([]);
        return;
      }

      setEvaluation(picked);

      const [criteriaList, scalesList, enrollmentsResponse, studentsResponse] =
        await Promise.all([
          rubricaService.getCriteria(),
          rubricaService.getScales(),
          inscripcionService.getEnrollments(),
          matriculaService.searchEstudiantes(''),
        ]);

      const rubricId = picked.rubric_id;

      const criteriaForRubric = (criteriaList || []).filter(
        (c: any) => c.rubric_id === rubricId,
      );

      const scalesByCriterion = new Map<string, any[]>();
      (scalesList || []).forEach((scale: any) => {
        const arr = scalesByCriterion.get(scale.criterion_id) || [];
        arr.push(scale);
        scalesByCriterion.set(scale.criterion_id, arr);
      });

      const enrollments = (enrollmentsResponse || []).filter(
        (en: any) => en.group_id === picked.group_id,
      );

      const studentsList = (studentsResponse?.data || studentsResponse) || [];
      const studentsById = new Map<string, any>();
      if (Array.isArray(studentsList)) {
        studentsList.forEach((s: any) => {
          studentsById.set(s.id, s);
        });
      }

      const buildCriteria = (criterion: any): CriterionOption => ({
        criterion_id: criterion.id,
        name: criterion.name,
        weight: criterion.weight,
        scales: (scalesByCriterion.get(criterion.id) || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          value: Number(s.value),
        })),
        selected_scale_id: null,
        comment: '',
      });

      const studentStates: StudentGradeState[] = (enrollments || []).map((en: any) => ({
        enrollment_id: en.id,
        student_id: en.student_id,
        student_name:
          (studentsById.get(en.student_id)?.nombre ||
            studentsById.get(en.student_id)?.first_name ||
            '') as string,
        criteria: criteriaForRubric.map(buildCriteria),
        status: 'UNSAVED',
      }));

      setStudents(studentStates);
    } catch (error) {
      console.error('useGrades loadData error', error);
      setStudents([]);
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSelectedScale = useCallback(
    (enrollmentId: string, criterionId: string, scaleId: string | null) => {
      setStudents((current) =>
        current.map((s) =>
          s.enrollment_id === enrollmentId
            ? {
                ...s,
                criteria: s.criteria.map((c) =>
                  c.criterion_id === criterionId
                    ? { ...c, selected_scale_id: scaleId }
                    : c,
                ),
              }
            : s,
        ),
      );
    },
    [],
  );

  const updateComment = useCallback(
    (enrollmentId: string, criterionId: string, comment: string) => {
      setStudents((current) =>
        current.map((s) =>
          s.enrollment_id === enrollmentId
            ? {
                ...s,
                criteria: s.criteria.map((c) =>
                  c.criterion_id === criterionId ? { ...c, comment } : c,
                ),
              }
            : s,
        ),
      );
    },
    [],
  );

  const saveDraft = useCallback(async (enrollmentId: string) => {
    const state = students.find((s) => s.enrollment_id === enrollmentId);
    if (!state || !evaluation) return null;

    const details: GradeDetailPayload[] = state.criteria
      .filter((c) => c.selected_scale_id)
      .map((c) => ({ scale_id: c.selected_scale_id as string, comment: c.comment }));

    const payload = {
      evaluation_id: evaluation.id,
      enrollment_id: state.enrollment_id,
      status: 'DRAFT' as const,
      details,
    };

    try {
      setSavingMap((m) => ({ ...m, [enrollmentId]: true }));
      const res = await gradeService.saveDraft(payload);
      setStudents((current) => current.map((s) => (s.enrollment_id === enrollmentId ? { ...s, status: 'DRAFT' } : s)));
      return res;
    } catch (error) {
      throw error;
    } finally {
      setSavingMap((m) => ({ ...m, [enrollmentId]: false }));
    }
  }, [students, evaluation]);

  const submitGrade = useCallback(async (enrollmentId: string) => {
    const state = students.find((s) => s.enrollment_id === enrollmentId);
    if (!state || !evaluation) return null;

    // Validate all criteria have selected scale
    const missing = state.criteria.filter((c) => !c.selected_scale_id);
    if (missing.length > 0) {
      // Return structured rejection so UI can highlight criterios faltantes
      return Promise.reject({ type: 'MISSING', missing: missing.map((c) => c.criterion_id) });
    }

    const details: GradeDetailPayload[] = state.criteria.map((c) => ({
      scale_id: c.selected_scale_id as string,
      comment: c.comment,
    }));

    const payload = {
      evaluation_id: evaluation.id,
      enrollment_id: state.enrollment_id,
      status: 'SENT' as const,
      details,
    };

    try {
      setSavingMap((m) => ({ ...m, [enrollmentId]: true }));
      const res = await gradeService.submitGrade(payload);
      setStudents((current) => current.map((s) => (s.enrollment_id === enrollmentId ? { ...s, status: 'SENT' } : s)));
      return res;
    } catch (error) {
      throw error;
    } finally {
      setSavingMap((m) => ({ ...m, [enrollmentId]: false }));
    }
  }, [students, evaluation]);

  const completeness = useMemo(() => {
    if (!students || students.length === 0) return 0;
    const totalCriteria = students.reduce((acc, s) => acc + s.criteria.length, 0);
    const answered = students.reduce(
      (acc, s) => acc + s.criteria.filter((c) => !!c.selected_scale_id).length,
      0,
    );
    return totalCriteria === 0 ? 0 : Math.round((answered / totalCriteria) * 100);
  }, [students]);

  return {
    loading,
    evaluation,
    students,
    completeness,
    savingMap,
    updateSelectedScale,
    updateComment,
    saveDraft,
    submitGrade,
    reload: loadData,
  };
};

export default useGrades;
