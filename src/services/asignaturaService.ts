import { api } from "../interceptors/authInterceptor";
import { Asignatura } from "../models/Asignatura";

const API_URL = "/academic/subjects";

interface ApiResponse<T> {
    message?: string;
    data?: T;
    status?: number;
}

class AsignaturaService {
    /**
     * Obtiene la lista de todas las asignaturas
     * GET /subjects
     */
    async getAsignaturas(): Promise<Asignatura[]> {
        try {
            const response = await api.get<ApiResponse<Asignatura[]>>(API_URL);
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener asignaturas:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene una asignatura por ID
     * GET /subjects/:id
     */
    async getAsignaturaById(id: string): Promise<Asignatura | null> {
        try {
            const response = await api.get<ApiResponse<Asignatura>>(`${API_URL}/${id}`);
            return (response.data?.data || response.data) as Asignatura;
        } catch (error: any) {
            console.error("Error al obtener asignatura por ID:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crea una nueva asignatura
     * POST /subjects
     */
    async createAsignatura(asignatura: Omit<Asignatura, 'id' | 'created_at' | 'updated_at'>): Promise<Asignatura> {
        try {
            const response = await api.post<ApiResponse<Asignatura>>(API_URL, asignatura);
            return (response.data?.data || response.data) as Asignatura;
        } catch (error: any) {
            console.error("Error al crear asignatura:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Actualiza una asignatura existente
     * PUT /subjects/:id
     */
    async updateAsignatura(id: string, asignatura: Partial<Asignatura>): Promise<Asignatura> {
        try {
            const response = await api.put<ApiResponse<Asignatura>>(
                `${API_URL}/${id}`,
                asignatura
            );
            return (response.data?.data || response.data) as Asignatura;
        } catch (error: any) {
            console.error("Error al actualizar asignatura:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Elimina una asignatura
     * DELETE /subjects/:id
     */
    async deleteAsignatura(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/${id}`);
        } catch (error: any) {
            console.error("Error al eliminar asignatura:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Busca asignaturas con filtros
     * GET /subjects/search?name=Programación&code=PRG101
     */
    async searchAsignaturas(filters: {
        name?: string;
        code?: string;
        credits?: number;
    }): Promise<Asignatura[]> {
        try {
            const queryParams = new URLSearchParams();
            if (filters.name) queryParams.append("name", filters.name);
            if (filters.code) queryParams.append("code", filters.code);
            if (filters.credits) queryParams.append("credits", String(filters.credits));

            const response = await api.get<ApiResponse<Asignatura[]>>(
                `${API_URL}/search?${queryParams.toString()}`
            );
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al buscar asignaturas:", error.response?.data || error.message);
            throw error;
        }
    }
}

export const asignaturaService = new AsignaturaService();
