import { api } from "../interceptors/authInterceptor";
import { User } from "../models/User";
import { generateCodeForRole } from "../utils/codeGenerator";
import SecurityService from "./securityService";

interface GoogleUserInfo {
    email: string;
    given_name: string;
    family_name: string;
    name: string;
}

class GoogleAuthService {
    /**
     * Registra un usuario con información de Google usando el endpoint existente del backend
     * POST /api/register
     */
    async registerWithGoogle(
        googleUserInfo: GoogleUserInfo,
        role: 'TEACHER' | 'STUDENT'
    ): Promise<{ user: User; token: string }> {
        try {
            console.log('GoogleAuthService: Iniciando registro', { googleUserInfo, role });
            
            // Primero verificar si el usuario ya existe buscando por email
            try {
                console.log('GoogleAuthService: Verificando si usuario existe por email');
                const searchResponse = await api.get('/users/search', {
                    params: { email: googleUserInfo.email }
                });
                
                const existingUsers = searchResponse.data;
                console.log('GoogleAuthService: Usuarios encontrados', existingUsers);
                
                if (existingUsers && existingUsers.length > 0) {
                    // El usuario ya existe
                    console.log('GoogleAuthService: Usuario ya existe');
                    
                    // No podemos hacer login porque no tenemos la contraseña
                    // En este caso, el usuario debería usar su contraseña normal
                    throw new Error('USER_EXISTS_WITH_PASSWORD');
                }
            } catch (searchError: any) {
                // Si la búsqueda falla o no encuentra usuarios, proceder a registro
                console.log('GoogleAuthService: Usuario no encontrado o error en búsqueda, procediendo a registro', searchError);
                
                if (searchError.message === 'USER_EXISTS_WITH_PASSWORD') {
                    throw searchError;
                }
            }
            
            // Generar código secuencial según el rol
            const code = await generateCodeForRole(role);
            console.log('GoogleAuthService: Código generado', code);
            
            // Generar contraseña basada en el email para que sea predecible
            const tempPassword = this.generateTempPassword(googleUserInfo.email);

            const payload = {
                email: googleUserInfo.email,
                password: tempPassword,
                code: code,
                role: role,
                first_name: googleUserInfo.given_name,
                last_name: googleUserInfo.family_name || '',
                identification: code,
            };

            console.log('GoogleAuthService: Enviando al backend', payload);

            // Usar el endpoint de registro público según el rol
            const registerEndpoint = role === 'TEACHER'
                ? '/users/public/register-teacher'
                : '/users/public/register-student';

            const response = await api.post(registerEndpoint, payload);
            console.log('GoogleAuthService: Respuesta del backend', response.data);

            // El backend retorna: { data: {...}, message: 'Teacher created' }
            const backendData = response.data.data || response.data;

            // Normalizar el usuario al formato del frontend
            const normalizedUser: User = {
                id: String(backendData.id || backendData.user_id),
                email: googleUserInfo.email,
                code: code, // Usar el código generado en el frontend
                role: role, // Usar el rol seleccionado por el usuario
                is_active: true,
                profile: {
                    first_name: googleUserInfo.given_name,
                    last_name: googleUserInfo.family_name || '',
                    identification: code,
                },
            };

            // Guardar token y usuario en localStorage
            const token = response.data.token || response.data.access_token || '';
            if (token) {
                localStorage.setItem('token', token);
            }
            localStorage.setItem('user', JSON.stringify(normalizedUser));

            return { user: normalizedUser, token };
        } catch (error: any) {
            console.error('GoogleAuthService: Error al registrar usuario con Google', error);
            
            if (error.message === 'USER_EXISTS_WITH_PASSWORD') {
                throw new Error('Este correo ya está registrado con una contraseña. Por favor usa tu contraseña normal para iniciar sesión.');
            }
            
            throw error;
        }
    }

    /**
     * Hace login con un usuario existente usando Google OAuth
     * Intenta hacer login con el email y el código del usuario como contraseña
     */
    async loginWithExistingUser(email: string, userCode: string, userRole: string): Promise<{ user: User; token: string }> {
        try {
            console.log('GoogleAuthService: Intentando login con usuario existente', { email, userCode, userRole });
            
            // Intentar hacer login usando el código como contraseña (esto podría funcionar si el backend lo permite)
            const user: User = {
                id: '',
                email: email,
                code: userCode,
                role: userRole as 'TEACHER' | 'STUDENT',
                is_active: true,
                password: userCode, // Usar el código como contraseña
            };

            const loggedInUser = await SecurityService.login(user);
            if (!loggedInUser) {
                throw new Error('Error al iniciar sesión');
            }
            
            // SecurityService.login retorna User, obtenemos el token del localStorage
            const token = localStorage.getItem('token') || '';
            
            return { user: loggedInUser, token };
        } catch (error: any) {
            console.error("Error al hacer login con usuario existente:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Genera una contraseña basada en el email del usuario para que sea predecible
     * Esto permite que el usuario pueda usar el formulario de login si es necesario
     */
    private generateTempPassword(email: string): string {
        // Generar una contraseña basada en el email (predecible pero segura)
        // El usuario puede usar su email como contraseña si lo desea
        return email + '@Google2024';
    }
}

export const googleAuthService = new GoogleAuthService();
