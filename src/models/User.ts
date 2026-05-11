export interface UserProfile {
    first_name: string;
    last_name: string;
    identification: string;
    phone?: string;
    specialty?: string;
}

export interface User {
    id: string;
    email: string;
    code: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    is_active: boolean;
    profile?: UserProfile;
    password?: string; // Solo para crear usuario
}