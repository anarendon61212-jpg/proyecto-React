import { api } from "../interceptors/authInterceptor";
import { Career, CareerFormValues } from "../models/Career";

const API_URL = "/careers";

type ApiResponse<T> = {
    data?: T;
    career?: T;
    careers?: T[];
    items?: T[];
    results?: T[];
    message?: string;
};

const readEntity = <T>(response: any): T | null => {
    const data = response?.data?.data ?? response?.data ?? response;
    return (data?.career ?? data ?? null) as T | null;
};

const readList = <T>(response: any): T[] => {
    const data = response?.data?.data ?? response?.data ?? response;
    if (Array.isArray(data)) return data as T[];
    if (Array.isArray(data?.careers)) return data.careers as T[];
    if (Array.isArray(data?.items)) return data.items as T[];
    if (Array.isArray(data?.results)) return data.results as T[];
    return [];
};

class CareerService {
    async getCareers(): Promise<Career[]> {
        try {
            const response = await api.get<ApiResponse<Career>>(API_URL);
            return readList<Career>(response);
        } catch (error) {
            console.error("Error al obtener carreras:", error);
            return [];
        }
    }

    async getCareerById(id: string): Promise<Career | null> {
        try {
            const response = await api.get<ApiResponse<Career>>(`${API_URL}/${id}`);
            return readEntity<Career>(response);
        } catch (error) {
            console.error("Error al obtener carrera:", error);
            return null;
        }
    }

    async createCareer(career: CareerFormValues): Promise<Career | null> {
        try {
            const response = await api.post<ApiResponse<Career>>(API_URL, career);
            return readEntity<Career>(response);
        } catch (error) {
            console.error("Error al crear carrera:", error);
            throw error;
        }
    }

    async updateCareer(id: string, career: Partial<CareerFormValues>): Promise<Career | null> {
        try {
            const response = await api.put<ApiResponse<Career>>(`${API_URL}/${id}`, career);
            return readEntity<Career>(response);
        } catch (error) {
            console.error("Error al actualizar carrera:", error);
            throw error;
        }
    }

    async archiveCareer(id: string): Promise<Career | null> {
        try {
            const response = await api.put<ApiResponse<Career>>(`${API_URL}/${id}`, { is_active: false });
            return readEntity<Career>(response);
        } catch (error) {
            console.error("Error al archivar carrera:", error);
            throw error;
        }
    }
}

export const careerService = new CareerService();
