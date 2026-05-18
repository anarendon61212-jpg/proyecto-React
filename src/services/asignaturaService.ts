import { api } from "../interceptors/authInterceptor";
import { Asignatura } from "../models/Asignatura";

const API_URL = "/academic/subjects";

interface ApiResponse<T> {
    message?: string;
    data?: T;
    status?: number;
}

// Adaptador para convertir datos del backend (camelCase) a formato frontend (snake_case)
const adaptAsignatura = (raw: any): Asignatura => {
    return {
        id: raw.id,
        name: raw.name || raw.nombre || '',
        code: raw.code || raw.codigo || '',
        description: raw.description || raw.descripcion || '',
        credits: raw.credits !== undefined ? raw.credits : (raw.creditos !== undefined ? raw.creditos : 1),
        is_active: typeof raw.is_active === 'boolean' ? raw.is_active : (typeof raw.isActive === 'boolean' ? raw.isActive : true),
        created_at: raw.created_at || raw.createdAt,
        updated_at: raw.updated_at || raw.updatedAt,
        grupos: raw.grupos,
        planesEstudio: raw.planesEstudio || raw.planes_estudio,
        evaluaciones: raw.evaluaciones,
    };
};

// Adaptador inverso para convertir datos del frontend (snake_case) a formato del backend (snake_case)
const adaptAsignaturaToBackend = (asignatura: Partial<Asignatura>): any => {
    return {
        id: asignatura.id,
        name: asignatura.name,
        code: asignatura.code,
        description: asignatura.description,
        credits: asignatura.credits,
        is_active: asignatura.is_active,
        created_at: asignatura.created_at,
        updated_at: asignatura.updated_at,
    };
};

class AsignaturaService {
    /**
     * Obtiene la lista de todas las asignaturas
     * GET /subjects
     */
    async getAsignaturas(): Promise<Asignatura[]> {
        try {
            const response = await api.get<ApiResponse<Asignatura[]>>(API_URL);
            console.log("Response from getAsignaturas:", response.data);
            const data = response.data?.data || response.data;
            console.log("Parsed data:", data);
            const result = Array.isArray(data) ? data.map(adaptAsignatura) : [];
            console.log("Final result:", result);
            return result;
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
            const data = response.data?.data || response.data;
            return data ? adaptAsignatura(data) : null;
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
            console.log("Creating asignatura with data:", JSON.stringify(asignatura, null, 2));
            const backendData = adaptAsignaturaToBackend(asignatura);
            console.log("Sending to backend:", JSON.stringify(backendData, null, 2));
            const response = await api.post<ApiResponse<Asignatura>>(API_URL, backendData);
            console.log("Response from createAsignatura:", response.data);
            const data = response.data?.data || response.data;
            return data ? adaptAsignatura(data) : data;
        } catch (error: any) {
            console.error("Error al crear asignatura:", error.response?.data || error.message);
            console.error("Full error:", error);
            console.error("Error status:", error.response?.status);
            console.error("Error response data:", JSON.stringify(error.response?.data, null, 2));
            throw error;
        }
    }

    /**
     * Actualiza una asignatura existente
     * PUT /subjects/:id
     */
    async updateAsignatura(id: string, asignatura: Partial<Asignatura>): Promise<Asignatura> {
        try {
            console.log("Updating asignatura with id:", id, "and data:", asignatura);
            const backendData = adaptAsignaturaToBackend(asignatura);
            console.log("Sending to backend:", backendData);
            const response = await api.put<ApiResponse<Asignatura>>(
                `${API_URL}/${id}`,
                backendData
            );
            console.log("Response from updateAsignatura:", response.data);
            const data = response.data?.data || response.data;
            return data ? adaptAsignatura(data) : data;
        } catch (error: any) {
            console.error("Error al actualizar asignatura:", error.response?.data || error.message);
            console.error("Full error:", error);
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
