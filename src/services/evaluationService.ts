import { api } from '../interceptors/authInterceptor';

export type EvaluationApi = {
  id: string;
  subject_id: string;
  group_id: string;
  rubric_id?: string | null;
  name: string;
  description?: string | null;
  weight: number;
  created_at?: string;
  updated_at?: string;
};

type ApiResponse<T> = {
  data?: T;
  message?: string;
  status?: number;
};

const readList = <T,>(response: any): T[] => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? (data as T[]) : [];
};

const readEntity = <T,>(response: any): T | null => {
  const data = response?.data?.data ?? response?.data ?? response;
  return (data || null) as T | null;
};

class EvaluationService {
  async getEvaluations(): Promise<EvaluationApi[]> {
    try {
      const response = await api.get<ApiResponse<EvaluationApi[]>>(
        '/evaluation/evaluations',
      );
      return readList<EvaluationApi>(response);
    } catch (error: any) {
      console.error(
        'Error al obtener evaluaciones:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async associateRubric(
    evaluationId: string,
    rubricId: string,
  ): Promise<EvaluationApi | null> {
    try {
      const response = await api.patch<ApiResponse<EvaluationApi>>(
        `/evaluation/evaluations/${evaluationId}/associate-rubric/${rubricId}`,
      );
      return readEntity<EvaluationApi>(response);
    } catch (error: any) {
      console.error(
        'Error al asociar rubrica a evaluacion:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

export const evaluationService = new EvaluationService();
