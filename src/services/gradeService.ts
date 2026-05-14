import { api } from '../interceptors/authInterceptor';
import type { GradePayload } from '../types/grade';

type ApiResponse<T> = {
  data?: T;
  message?: string;
  status?: number;
};

class GradeService {
  async saveDraft(payload: GradePayload) {
    try {
      const body = { ...payload, status: 'DRAFT' };
      const response = await api.post<ApiResponse<any>>('/grades', body);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error saving draft grade:', error.response?.data || error.message);
      throw error;
    }
  }

  async submitGrade(payload: GradePayload) {
    try {
      const body = { ...payload, status: 'SENT' };
      const response = await api.post<ApiResponse<any>>('/grades', body);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error submitting grade:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEvaluationGrades(evaluationId: string) {
    try {
      const response = await api.get<ApiResponse<any>>(`/grades?evaluation_id=${evaluationId}`);
      return response.data?.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching grades for evaluation:', error.response?.data || error.message);
      // Devolver array vacío para no romper la UI si backend no expone este endpoint
      return [];
    }
  }
}

export const gradeService = new GradeService();
