import { api } from "../interceptors/authInterceptor";
import { PlanEstudio } from "../models/PlanEstudio";

const API_URL = "/academic/study-plans";

interface ApiResponse<T> {
    message?: string;
    data?: T;
    status?: number;
}

class StudyPlanService {
    /**
     * Obtiene la lista de planes de estudio
     * GET /study-plans
     */
    async getStudyPlans(): Promise<PlanEstudio[]> {
        try {
            const response = await api.get<ApiResponse<PlanEstudio[]>>(API_URL);
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener planes de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene planes de estudio por carrera
     * GET /study-plans/career/:careerId
     */
    async getStudyPlansByCareer(careerId: string): Promise<PlanEstudio[]> {
        try {
            const response = await api.get<ApiResponse<PlanEstudio[]>>(
                `${API_URL}/career/${careerId}`
            );
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener planes de estudio por carrera:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene planes de estudio activos por carrera
     * GET /study-plans/career/:careerId/active
     */
    async getActiveStudyPlansByCareer(careerId: string): Promise<PlanEstudio[]> {
        try {
            const response = await api.get<ApiResponse<PlanEstudio[]>>(
                `${API_URL}/career/${careerId}/active`
            );
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener planes de estudio activos:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene el historial de versiones de planes de estudio por carrera
     * GET /study-plans/career/:careerId/versions
     */
    async getStudyPlanVersions(careerId: string): Promise<PlanEstudio[]> {
        try {
            const response = await api.get<ApiResponse<PlanEstudio[]>>(
                `${API_URL}/career/${careerId}/versions`
            );
            const data = response.data?.data || response.data;
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            console.error("Error al obtener versiones de planes de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crea un nuevo plan de estudio
     * POST /study-plans
     */
    async createStudyPlan(studyPlan: Omit<PlanEstudio, 'id' | 'created_at' | 'updated_at'>): Promise<PlanEstudio> {
        try {
            const response = await api.post<ApiResponse<PlanEstudio>>(API_URL, studyPlan);
            return (response.data?.data || response.data) as PlanEstudio;
        } catch (error: any) {
            console.error("Error al crear plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Actualiza un plan de estudio existente
     * PUT /study-plans/:id
     */
    async updateStudyPlan(id: string, studyPlan: Partial<PlanEstudio>): Promise<PlanEstudio> {
        try {
            const response = await api.put<ApiResponse<PlanEstudio>>(
                `${API_URL}/${id}`,
                studyPlan
            );
            return (response.data?.data || response.data) as PlanEstudio;
        } catch (error: any) {
            console.error("Error al actualizar plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Elimina un plan de estudio
     * DELETE /study-plans/:id
     */
    async deleteStudyPlan(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/${id}`);
        } catch (error: any) {
            console.error("Error al eliminar plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Agrega asignatura al plan de estudios de una carrera
     * POST /study-plans/career/:careerId/add-subject
     */
    async addSubjectToStudyPlan(
        careerId: string,
        subjectData: {
            asignatura_id: string;
            semestre_sugerido: number;
            creditos: number;
        }
    ): Promise<PlanEstudio> {
        try {
            const response = await api.post<ApiResponse<PlanEstudio>>(
                `${API_URL}/career/${careerId}/add-subject`,
                subjectData
            );
            return (response.data?.data || response.data) as PlanEstudio;
        } catch (error: any) {
            console.error("Error al agregar asignatura al plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Remueve asignatura del plan de estudios de una carrera
     * DELETE /study-plans/:id/remove-subject
     */
    async removeSubjectFromStudyPlan(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/${id}/remove-subject`);
        } catch (error: any) {
            console.error("Error al remover asignatura del plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Crea una nueva versión del plan de estudios
     * POST /study-plans/career/:careerId/new-version
     */
    async createNewVersion(careerId: string): Promise<PlanEstudio[]> {
        try {
            const response = await api.post<ApiResponse<PlanEstudio[]>>(
                `${API_URL}/career/${careerId}/new-version`
            );
            return (response.data?.data || response.data) as PlanEstudio[];
        } catch (error: any) {
            console.error("Error al crear nueva versión del plan de estudio:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene un plan de estudio por ID
     * GET /study-plans/:id
     */
    async getStudyPlanById(id: string): Promise<PlanEstudio | null> {
        try {
            const response = await api.get<ApiResponse<PlanEstudio>>(`${API_URL}/${id}`);
            return (response.data?.data || response.data) as PlanEstudio;
        } catch (error: any) {
            console.error("Error al obtener plan de estudio por ID:", error.response?.data || error.message);
            throw error;
        }
    }
}

export const studyPlanService = new StudyPlanService();
