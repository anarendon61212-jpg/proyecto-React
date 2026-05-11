import { api } from "../interceptors/authInterceptor";

const API_URL = "/groups";

class GrupoService {
  async asignarDocente(grupoId: string, docenteId: string) {
    return api.patch(`${API_URL}/${grupoId}/assign-teacher/${docenteId}`);
  }

  async getGrupos() {
    return api.get(API_URL);
  }

  async getGrupoById(id: string) {
    return api.get(`${API_URL}/${id}`);
  }
}

export const grupoService = new GrupoService();
