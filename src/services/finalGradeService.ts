import { api } from '../interceptors/authInterceptor';

export interface FinalGradeResponse {
  id: string;
  enrollment_id: string;
  final_grade: number;
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinalGradePersistenceResult {
  persistedCount: number;
  attemptedCount: number;
  mode: 'batch' | 'single' | 'none';
  warning?: string;
}

export interface EvaluationForFinalGrade {
  id: string;
  group_id: string;
  name: string;
  weight: number;
  rubric_id?: string | null;
}

export interface GradeForFinalGrade {
  id?: string;
  enrollment_id: string;
  final_score?: number | null;
  status?: string;
  is_locked?: boolean;
}

export interface FinalizationStatusResponse {
  group_id: string;
  finalized: boolean;
  finalized_at?: string | null;
  locked?: boolean;
}

export interface FinalizationListItem {
  group_id: string;
  finalized: boolean;
  finalized_at?: string | null;
  locked?: boolean;
}

export interface FinalizeGroupResponse {
  success: boolean;
  finalized: boolean;
  finalized_at: string;
  locked: boolean;
}

type ApiResponse<T> = {
  data?: T;
  message?: string;
  status?: number;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value: string) => UUID_REGEX.test(value);

const readList = <T,>(response: any): T[] => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? (data as T[]) : [];
};

const readEntity = <T,>(response: any): T | null => {
  const data = response?.data?.data ?? response?.data ?? response;
  return (data || null) as T | null;
};

const readBlob = (response: any): Blob => {
  const blob = response?.data;
  if (!(blob instanceof Blob)) {
    throw new Error('El backend no devolvio un archivo PDF valido.');
  }
  return blob;
};

class FinalGradeService {
  async getGroupEvaluations(groupId: string): Promise<EvaluationForFinalGrade[]> {
    if (!isValidUuid(groupId)) return [];
    const response = await api.get<ApiResponse<EvaluationForFinalGrade[]>>(
      `/evaluation/evaluations?group_id=${groupId}`,
    );
    return readList<EvaluationForFinalGrade>(response);
  }

  async getEvaluationGrades(evaluationId: string): Promise<GradeForFinalGrade[]> {
    if (!isValidUuid(evaluationId)) return [];
    const response = await api.get<ApiResponse<GradeForFinalGrade[]>>(
      `/grades?evaluation_id=${evaluationId}`,
    );
    return readList<GradeForFinalGrade>(response);
  }

  async getEnrollmentsByGroupId(groupId: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(
      `/academic/enrollments?group_id=${groupId}`,
    );
    return readList<any>(response);
  }

  calculateFinalGrade(
    evaluationGrades: Array<{ weight: number; final_score: number }>,
  ): number {
    if (!evaluationGrades || evaluationGrades.length === 0) {
      return 0;
    }

    const weightedSum = evaluationGrades.reduce((sum, eg) => {
      return sum + (eg.final_score * eg.weight) / 100;
    }, 0);

    return Math.round(weightedSum * 100) / 100;
  }

  async getFinalizationStatus(groupId: string): Promise<FinalizationStatusResponse> {
    const response = await api.get<ApiResponse<FinalizationStatusResponse>>(
      `/grades/finalize/group/${groupId}/status`,
    );

    const status = readEntity<FinalizationStatusResponse>(response);
    if (!status) {
      throw new Error('No se pudo obtener el estado de consolidacion del grupo.');
    }

    return status;
  }

  async getFinalizationOverview(): Promise<FinalizationListItem[]> {
    const response = await api.get<ApiResponse<FinalizationListItem[]>>(
      '/grades/finalize/groups',
    );
    return readList<FinalizationListItem>(response);
  }

  async finalizeGroup(groupId: string): Promise<FinalizeGroupResponse> {
    if (!isValidUuid(groupId)) {
      throw new Error('UUID de grupo invalido');
    }

    const response = await api.post<ApiResponse<FinalizeGroupResponse>>(
      `/grades/finalize/group/${groupId}`,
      { confirmed: true },
    );

    const result = readEntity<FinalizeGroupResponse>(response);
    if (!result) {
      throw new Error('El backend no retorno una respuesta valida de consolidacion.');
    }

    return result;
  }

  async downloadOfficialReport(groupId: string): Promise<Blob> {
    const response = await api.get(`/grades/finalize/group/${groupId}/report`, {
      responseType: 'blob',
    });
    return readBlob(response);
  }
}

export const finalGradeService = new FinalGradeService();
