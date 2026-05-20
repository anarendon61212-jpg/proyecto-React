import { api } from '../interceptors/authInterceptor';

export type CreateEnrollmentPayload = {
  student_id: string;
  group_id: string;
  status?: string;
};

export type EnrollmentApi = {
  id: string;
  student_id: string;
  group_id: string;
  enrollment_date?: string;
  status?: string;
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

class InscripcionService {
  async createEnrollment(payload: CreateEnrollmentPayload) {
    return api.post<ApiResponse<EnrollmentApi>>('/academic/enrollments', payload);
  }

  async getEnrollments(): Promise<EnrollmentApi[]> {
    try {
      const response = await api.get<ApiResponse<EnrollmentApi[]>>('/academic/enrollments');
      return readList<EnrollmentApi>(response);
    } catch (error: any) {
      console.error(
        'Error al obtener inscripciones:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async cancelEnrollment(enrollmentId: string) {
    return api.put(`/academic/enrollments/${enrollmentId}`, { status: 'CANCELLED' });
  }
}

export const inscripcionService = new InscripcionService();
