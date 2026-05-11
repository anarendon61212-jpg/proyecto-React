import { api } from "../interceptors/authInterceptor";

const API_URL = "/teachers";

class DocenteService {
  async getDocentes() {
    return api.get(API_URL);
  }

  async getDocenteById(id: string) {
    return api.get(`${API_URL}/${id}`);
  }
}

export const docenteService = new DocenteService();
