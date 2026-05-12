import { api } from "../interceptors/authInterceptor";
import { Semester, SemesterFormValues } from "../models/Semester";

const API_URL = "/academic/semesters";

type ApiResponse<T> = {
    data?: T;
    semester?: T;
    semesters?: T[];
    items?: T[];
    results?: T[];
    message?: string;
};

const readEntity = <T>(response: any): T | null => {
    const data = response?.data?.data ?? response?.data ?? response;
    return (data?.semester ?? data ?? null) as T | null;
};

const readList = <T>(response: any): T[] => {
    const data = response?.data?.data ?? response?.data ?? response;
    if (Array.isArray(data)) return data as T[];
    if (Array.isArray(data?.semesters)) return data.semesters as T[];
    if (Array.isArray(data?.items)) return data.items as T[];
    if (Array.isArray(data?.results)) return data.results as T[];
    return [];
};

class SemesterService {
    async getSemesters(): Promise<Semester[]> {
        try {
            const response = await api.get<ApiResponse<Semester>>(API_URL);
            return readList<Semester>(response);
        } catch (error) {
            console.error("Error al obtener semestres:", error);
            return [];
        }
    }

    async getSemesterById(id: string): Promise<Semester | null> {
        try {
            const response = await api.get<ApiResponse<Semester>>(`${API_URL}/${id}`);
            return readEntity<Semester>(response);
        } catch (error) {
            console.error("Error al obtener semestre:", error);
            return null;
        }
    }

    async getActiveSemesters(): Promise<Semester[]> {
        try {
            const semesters = await this.getSemesters();
            return semesters.filter((semester) => semester.is_active);
        } catch (error) {
            console.error("Error al obtener semestres activos:", error);
            return [];
        }
    }

    async createSemester(semester: SemesterFormValues): Promise<Semester | null> {
        try {
            const response = await api.post<ApiResponse<Semester>>(API_URL, semester);
            return readEntity<Semester>(response);
        } catch (error) {
            console.error("Error al crear semestre:", error);
            throw error;
        }
    }

    async updateSemester(id: string, semester: Partial<SemesterFormValues>): Promise<Semester | null> {
        try {
            const response = await api.put<ApiResponse<Semester>>(`${API_URL}/${id}`, semester);
            return readEntity<Semester>(response);
        } catch (error) {
            console.error("Error al actualizar semestre:", error);
            throw error;
        }
    }

    async closeSemester(id: string): Promise<Semester | null> {
        try {
            const response = await api.put<ApiResponse<Semester>>(`${API_URL}/${id}`, { is_active: false });
            return readEntity<Semester>(response);
        } catch (error) {
            console.error("Error al cerrar semestre:", error);
            throw error;
        }
    }
}

export const semesterService = new SemesterService();
