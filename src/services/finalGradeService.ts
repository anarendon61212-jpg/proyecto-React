import { api } from '../interceptors/authInterceptor';
import { gradeService } from './gradeService';

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

const isValidId = (value: any) => {
  if (value === undefined || value === null) return false;
  const s = String(value).trim();
  return s.length > 0;
};

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
    if (!isValidId(groupId)) return [];
    const response = await api.get<ApiResponse<EvaluationForFinalGrade[]>>(
      `/evaluation/evaluations?group_id=${groupId}`,
    );
    return readList<EvaluationForFinalGrade>(response);
  }

  async getEvaluationGrades(evaluationId: string): Promise<GradeForFinalGrade[]> {
    if (!isValidId(evaluationId)) return [];
    // Reusar la lógica de consulta de notas centralizada en gradeService
    const grades = await gradeService.getEvaluationGrades(evaluationId);
    // Mapear al tipo local si es necesario
    return (grades as any) as GradeForFinalGrade[];
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
    try {
      const response = await api.get<ApiResponse<FinalizationStatusResponse>>(
        `/grades/finalize/group/${groupId}/status`,
      );

      const status = readEntity<FinalizationStatusResponse>(response);
      if (!status) {
        throw new Error('No se pudo obtener el estado de consolidacion del grupo.');
      }

      return status;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          group_id: groupId,
          finalized: false,
          finalized_at: null,
          locked: false,
        };
      }

      throw error;
    }
  }

  async getFinalizationOverview(): Promise<FinalizationListItem[]> {
    try {
      const response = await api.get<ApiResponse<FinalizationListItem[]>>(
        '/grades/finalize/groups',
      );
      return readList<FinalizationListItem>(response);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }

      throw error;
    }
  }

  async finalizeGroup(groupId: string): Promise<FinalizeGroupResponse> {
    if (!isValidId(groupId)) {
      throw new Error('Identificador de grupo inválido');
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
