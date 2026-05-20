import { api } from "../interceptors/authInterceptor";
import { userService } from "./userService";

export type CreateMatriculaPayload = {
  student_id: string;
  career_id: string;
  admission_period: string;
  academic_status: string;
};

export type SearchStudentApi = {
  id: string;
  user_id?: string;
  code?: string;
  codigo?: string;
  user_code?: string;
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

  async getStudents() {
    const [studentsResponse, users] = await Promise.all([
      api.get("/academic/students"),
      userService.getUsers().catch(() => []),
    ]);

    const students = studentsResponse.data?.data || studentsResponse.data || [];

    if (!Array.isArray(students)) {
      return [];
    }

    return students.map((student: SearchStudentApi) => {
      const studentIdentification = (
        student.cedula ||
        student.identification ||
        student.profile?.identification ||
        ""
      ).trim();

      const matchedUser = users.find((user) => {
        const userIdentification = (user.profile?.identification || "").trim();
        return (
          (student.user_id && user.id === student.user_id) ||
          (!!studentIdentification && userIdentification === studentIdentification)
        );
      });

      return {
        ...student,
        user_id: student.user_id || matchedUser?.id,
        code: student.code || student.codigo || student.user_code || matchedUser?.code,
        codigo: student.codigo || student.code || student.user_code || matchedUser?.code,
        user_code: student.user_code || student.code || student.codigo || matchedUser?.code,
      };
    });
  }

  async getSemesters() {
    return api.get("/academic/semesters");
  }

  async updateRegistration(registrationId: string, payload: Partial<CreateMatriculaPayload> & { is_active?: boolean }) {
    return api.put(`/academic/registrations/${registrationId}`, payload);
  }

  async searchEstudiantes(search: string) {
    const students = await this.getStudents();
    const term = search.trim().toLowerCase();

    if (!Array.isArray(students)) {
      return { data: [] };
    }

    const filtered = students.filter((student: SearchStudentApi) => {
      const firstName = (student.nombre || student.first_name || student.profile?.first_name || "").toLowerCase();
      const lastName = (student.apellido || student.last_name || student.profile?.last_name || "").toLowerCase();
      const identification = (student.cedula || student.identification || student.profile?.identification || "").toLowerCase();
      const code = (student.code || student.codigo || student.user_code || "").toLowerCase();

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        identification.includes(term) ||
        code.includes(term)
      );
    });

    return { data: filtered };
  }
}

export const matriculaService = new MatriculaService();
