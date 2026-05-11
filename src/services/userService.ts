import { api } from "../interceptors/authInterceptor";
import { User } from "../models/User";

const API_URL = "/users";

interface ApiResponse<T> {
    message?: string;
    data?: T;
    status?: number;
}

class UserService {
    /**
     * Obtiene la lista de todos los usuarios
     * GET /users
     */
    async getUsers(): Promise<User[]> {
        try {
            const response = await api.get<ApiResponse<User[]>>(API_URL);
            // El backend puede retornar { data: [...] } o directamente [...]
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener usuarios:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Busca usuarios con filtros
     * GET /users/search?role=TEACHER&is_active=true&code=A001
     */
    async searchUsers(filters: {
        role?: string;
        is_active?: boolean;
        code?: string;
        email?: string;
    }): Promise<User[]> {
        try {
            const queryParams = new URLSearchParams();
            if (filters.role) queryParams.append("role", filters.role);
            if (filters.is_active !== undefined) queryParams.append("is_active", String(filters.is_active));
            if (filters.code) queryParams.append("code", filters.code);
            if (filters.email) queryParams.append("email", filters.email);

            const response = await api.get<ApiResponse<User[]>>(
                `${API_URL}/search?${queryParams.toString()}`
            );
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al buscar usuarios:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene un usuario por ID
     * GET /users/:id
     */
    async getUserById(id: string): Promise<User | null> {
        try {
            const response = await api.get<ApiResponse<User>>(`${API_URL}/${id}`);
            const data = response.data?.data || response.data;
            return data || null;
        } catch (error: any) {
            console.error("Usuario no encontrado:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crea un nuevo usuario
     * POST /users
     */
    async createUser(user: Omit<User, "id">): Promise<User | null> {
        try {
            const response = await api.post<ApiResponse<User>>(API_URL, user);
            const data = response.data?.data || response.data;
            return data || null;
        } catch (error: any) {
            console.error("Error al crear usuario:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Actualiza un usuario existente
     * PUT /users/:id
     */
    async updateUser(id: string, user: Partial<User>): Promise<User | null> {
        try {
            const response = await api.put<ApiResponse<User>>(`${API_URL}/${id}`, user);
            const data = response.data?.data || response.data;
            return data || null;
        } catch (error: any) {
            console.error("Error al actualizar usuario:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Desactiva un usuario (no lo elimina)
     * PATCH /users/:id/deactivate
     */
    async deactivateUser(id: string): Promise<User | null> {
        try {
            const response = await api.patch<ApiResponse<User>>(
                `${API_URL}/${id}/deactivate`
            );
            const data = response.data?.data || response.data;
            return data || null;
        } catch (error: any) {
            console.error("Error al desactivar usuario:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Elimina un usuario (no utilizar - usar deactivateUser en su lugar)
     * DELETE /users/:id
     * @deprecated Usar deactivateUser en su lugar
     */
    async deleteUser(id: string): Promise<boolean> {
        try {
            await api.delete(`${API_URL}/${id}`);
            return true;
        } catch (error: any) {
            console.error("Error al eliminar usuario:", error.response?.data || error.message);
            throw error;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const userService = new UserService();
