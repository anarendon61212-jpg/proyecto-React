import { api } from "../interceptors/authInterceptor";
import { User } from "../models/User";
import { generateCodeForRole } from "../utils/codeGenerator";

interface Auth0UserInfo {
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
    nickname?: string;
    picture?: string;
    sub?: string;
}

class Auth0AuthService {
    async registerWithAuth0(
        auth0UserInfo: Auth0UserInfo,
        role: 'TEACHER' | 'STUDENT'
    ): Promise<{ user: User; token: string }> {
        try {
            console.log('Auth0AuthService: Iniciando registro', { auth0UserInfo, role });

            const fallbackIdentifier = this.getFallbackIdentifier(auth0UserInfo);
            const email = auth0UserInfo.email?.trim() || fallbackIdentifier;

            const code = await generateCodeForRole(role);
            console.log('Auth0AuthService: Código generado', code);

            const tempPassword = this.generateTempPassword(fallbackIdentifier);

            const payload = {
                email: email,
                password: tempPassword,
                code: code,
                role: role,
                first_name: auth0UserInfo.given_name || auth0UserInfo.name?.split(' ')[0] || 'Usuario',
                last_name: auth0UserInfo.family_name || auth0UserInfo.name?.split(' ').slice(1).join(' ') || '',
                identification: code,
            };

            console.log('Auth0AuthService: Enviando al backend', payload);

            const registerEndpoint = role === 'TEACHER'
                ? '/users/public/register-teacher'
                : '/users/public/register-student';

            const response = await api.post(registerEndpoint, payload);
            console.log('Auth0AuthService: Respuesta del backend', response.data);

            const backendData = response.data.data || response.data;

            const normalizedUser: User = {
                id: String(backendData.id || backendData.user_id),
                email: email,
                code: code,
                role: role,
                is_active: true,
                profile: {
                    first_name: auth0UserInfo.given_name || auth0UserInfo.name?.split(' ')[0] || 'Usuario',
                    last_name: auth0UserInfo.family_name || auth0UserInfo.name?.split(' ').slice(1).join(' ') || '',
                    identification: code,
                },
            };

            const token = response.data.token || response.data.access_token || '';
            if (token) {
                localStorage.setItem('token', token);
            }
            localStorage.setItem('user', JSON.stringify(normalizedUser));

            return { user: normalizedUser, token };
        } catch (error: any) {
            console.error('Auth0AuthService: Error al registrar usuario con GitHub', error);
            throw error;
        }
    }

    private getFallbackIdentifier(auth0UserInfo: Auth0UserInfo): string {
        const fallback = auth0UserInfo.nickname || auth0UserInfo.name || auth0UserInfo.sub || 'auth0-user';
        return fallback.trim();
    }

    private generateTempPassword(identifier: string): string {
        return identifier + '@Auth0GitHub2024';
    }
}

export const auth0AuthService = new Auth0AuthService();