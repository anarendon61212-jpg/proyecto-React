import { api } from '../interceptors/authInterceptor';
import type { GradeApi, GradePayload } from '../types/grade';

type ApiResponse<T> = {
  data?: T;
  message?: string;
  status?: number;
};

const isValidId = (value: any) => {
  if (value === undefined || value === null) return false;
  const s = String(value).trim();
  return s.length > 0;
};

const readList = <T,>(response: any): T[] => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? (data as T[]) : [];
};

class GradeService {
  async saveDraft(payload: GradePayload) {
    try {
      const body = { ...payload, status: 'DRAFT' };
      const response = await api.post<ApiResponse<any>>('/evaluation/grades', body);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error saving draft grade:', error.response?.data || error.message);
      throw error;
    }
  }

  async submitGrade(payload: GradePayload) {
    try {
      const body = { ...payload, status: 'SENT' };
      const response = await api.post<ApiResponse<any>>('/evaluation/grades', body);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error submitting grade:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEvaluationGrades(evaluationId: string): Promise<GradeApi[]> {
    if (!isValidId(evaluationId)) {
      return [];
    }

    try {
      const response = await api.get<ApiResponse<any>>(
        `/grades?evaluation_id=${evaluationId}`,
      );
      return readList<GradeApi>(response);
    } catch (error: any) {
      console.error('Error fetching grades for evaluation:', error.response?.data || error.message);
      // Devolver array vacío para no romper la UI si backend no expone este endpoint
      return [];
    }
  }

  async getGradeByEnrollmentAndEvaluation(
    evaluationId: string,
    enrollmentId: string,
  ): Promise<GradeApi | null> {
    const grades = await this.getEvaluationGrades(evaluationId);
    return grades.find((grade) => grade.enrollment_id === enrollmentId) || null;
  }

  async updateGrade(payload: GradePayload) {
    // El backend confirmado usa POST /evaluation/grades como punto de persistencia única.
    return this.saveDraft({ ...payload, status: payload.status });
  }
}

export const gradeService = new GradeService();
