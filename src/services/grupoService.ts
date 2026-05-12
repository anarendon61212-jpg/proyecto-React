import { api } from "../interceptors/authInterceptor";

const API_URL = "/academic/groups";

class GrupoService {
  asignarDocente(grupoId: string, docenteId: string) {
    return api.patch(`/academic/groups/${grupoId}/assign-teacher/${docenteId}`);
  }

  async getGrupos() {
    return api.get(API_URL);
  }

  async getGrupoById(id: string) {
    return api.get(`${API_URL}/${id}`);
  }
}

export const grupoService = new GrupoService();
