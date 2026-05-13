import { api } from "../interceptors/authInterceptor";

export type CreateMatriculaPayload = {
  estudiante_id: string;
  carrera_id: string;
  periodo_ingreso: string;
  estado_academico: string;
};

export type SearchStudentApi = {
  id: string;
  role?: string;
  is_active?: boolean;
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

class MatriculaService {
  async createMatricula(payload: CreateMatriculaPayload) {
    return api.post("/academic/registrations", payload);
  }

  async getCarreras() {
    // Usar la misma ruta que el resto del proyecto
    return api.get("/academic/careers");
  }

  async searchEstudiantes(search: string) {
    const response = await api.get("/users");
    const users = response.data?.data || response.data || [];
    const term = search.trim().toLowerCase();

    if (!Array.isArray(users)) {
      return { data: [] };
    }

    const filtered = users.filter((user: SearchStudentApi) => {
      const role = (user.role || "").toUpperCase();
      if (role !== "STUDENT") return false;

      const firstName = (user.nombre || user.first_name || user.profile?.first_name || "").toLowerCase();
      const lastName = (user.apellido || user.last_name || user.profile?.last_name || "").toLowerCase();
      const identification = (user.cedula || user.identification || user.profile?.identification || "").toLowerCase();

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
