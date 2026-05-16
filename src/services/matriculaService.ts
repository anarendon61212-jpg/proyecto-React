import { api } from "../interceptors/authInterceptor";

export type CreateMatriculaPayload = {
  student_id: string;
  career_id: string;
  admission_period: string;
  academic_status: string;
};

export type SearchStudentApi = {
  id: string;
  user_id?: string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  first_name?: string;
  last_name?: string;
  identification?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    identification?: string;
  };
};

export type RegistrationApi = {
  id: string;
  student_id?: string;
  career_id?: string;
  admission_period?: string;
  academic_status?: string;
  is_active?: boolean;
};

export type SemesterApi = {
  id: string;
  name?: string;
  code?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
};

class MatriculaService {
  async createMatricula(payload: CreateMatriculaPayload) {
    console.log('Payload matrícula:', payload);
    return api.post("/academic/registrations", payload);
  }

  async getCarreras() {
    // Usar la misma ruta que el resto del proyecto
    return api.get("/academic/careers");
  }

  async getRegistrations() {
    return api.get("/academic/registrations");
  }

  async getSemesters() {
    return api.get("/academic/semesters");
  }

  async updateRegistration(registrationId: string, payload: Partial<CreateMatriculaPayload> & { is_active?: boolean }) {
    return api.put(`/academic/registrations/${registrationId}`, payload);
  }

  async searchEstudiantes(search: string) {
    const response = await api.get("/academic/students");
    const students = response.data?.data || response.data || [];
    const term = search.trim().toLowerCase();

    if (!Array.isArray(students)) {
      return { data: [] };
    }

    const filtered = students.filter((student: SearchStudentApi) => {
      const firstName = (student.nombre || student.first_name || student.profile?.first_name || "").toLowerCase();
      const lastName = (student.apellido || student.last_name || student.profile?.last_name || "").toLowerCase();
      const identification = (student.cedula || student.identification || student.profile?.identification || "").toLowerCase();

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        identification.includes(term)
      );
    });

    return { data: filtered };
  }
}

export const matriculaService = new MatriculaService();
