import { api } from '../interceptors/authInterceptor';

export type RubricApi = {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CriterionApi = {
  id: string;
  rubric_id: string;
  name: string;
  description: string;
  weight: number;
  created_at?: string;
  updated_at?: string;
};

export type ScaleApi = {
  id: string;
  criterion_id: string;
  name: string;
  description: string;
  value: number;
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

class RubricaService {
  async getRubrics(): Promise<RubricApi[]> {
    try {
      const response = await api.get<ApiResponse<RubricApi[]>>('/evaluation/rubrics');
      return readList<RubricApi>(response);
    } catch (error: any) {
      console.error('Error al obtener rubricas:', error.response?.data || error.message);
      throw error;
    }
  }

  async createRubric(payload: {
    title: string;
    description: string;
    is_public?: boolean;
    is_archived?: boolean;
  }): Promise<RubricApi> {
    const response = await api.post<ApiResponse<RubricApi>>('/evaluation/rubrics', payload);
    return (response.data?.data || response.data) as RubricApi;
  }

  async updateRubric(
    rubricId: string,
    payload: Partial<Pick<RubricApi, 'title' | 'description' | 'is_public' | 'is_archived'>>,
  ): Promise<RubricApi> {
    const response = await api.put<ApiResponse<RubricApi>>(
      `/evaluation/rubrics/${rubricId}`,
      payload,
    );
    return (response.data?.data || response.data) as RubricApi;
  }

  async deleteRubric(rubricId: string) {
    return api.delete(`/evaluation/rubrics/${rubricId}`);
  }

  async publishRubric(rubricId: string): Promise<RubricApi> {
    const response = await api.patch<ApiResponse<RubricApi>>(
      `/evaluation/rubrics/${rubricId}/publish`,
    );
    return (response.data?.data || response.data) as RubricApi;
  }

  async getCriteria(): Promise<CriterionApi[]> {
    try {
      const response = await api.get<ApiResponse<CriterionApi[]>>('/evaluation/criteria');
      return readList<CriterionApi>(response);
    } catch (error: any) {
      console.error('Error al obtener criterios:', error.response?.data || error.message);
      throw error;
    }
  }

  async createCriterion(payload: {
    rubric_id: string;
    name: string;
    description: string;
    weight: number;
  }): Promise<CriterionApi> {
    const response = await api.post<ApiResponse<CriterionApi>>('/evaluation/criteria', payload);
    return (response.data?.data || response.data) as CriterionApi;
  }

  async updateCriterion(criterionId: string, payload: Partial<Pick<CriterionApi, 'name' | 'description' | 'weight'>>) {
    const response = await api.put<ApiResponse<CriterionApi>>(`/evaluation/criteria/${criterionId}`, payload);
    return (response.data?.data || response.data) as CriterionApi;
  }

  async deleteCriterion(criterionId: string) {
    return api.delete(`/evaluation/criteria/${criterionId}`);
  }

  async getScales(): Promise<ScaleApi[]> {
    try {
      const response = await api.get<ApiResponse<ScaleApi[]>>('/evaluation/scales');
      return readList<ScaleApi>(response);
    } catch (error: any) {
      console.error('Error al obtener escalas:', error.response?.data || error.message);
      throw error;
    }
  }

  async createScale(payload: {
    criterion_id: string;
    name: string;
    description: string;
    value: number;
  }): Promise<ScaleApi> {
    const response = await api.post<ApiResponse<ScaleApi>>('/evaluation/scales', payload);
    return (response.data?.data || response.data) as ScaleApi;
  }

  async updateScale(scaleId: string, payload: Partial<Pick<ScaleApi, 'name' | 'description' | 'value'>>) {
    const response = await api.put<ApiResponse<ScaleApi>>(`/evaluation/scales/${scaleId}`, payload);
    return (response.data?.data || response.data) as ScaleApi;
  }

  async deleteScale(scaleId: string) {
    return api.delete(`/evaluation/scales/${scaleId}`);
  }
}

export const rubricaService = new RubricaService();
