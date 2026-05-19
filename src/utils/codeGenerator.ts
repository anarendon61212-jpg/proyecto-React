import { User } from "../models/User";
import { userService } from "../services/userService";

/**
 * Genera el siguiente código secuencial para un rol específico
 * @param role - Rol del usuario ('TEACHER' o 'STUDENT')
 * @param existingUsers - Lista de usuarios existentes para calcular el siguiente código
 * @returns Código generado (ej: TCH-002, EST-003)
 */
export const generateSequentialCode = (role: 'TEACHER' | 'STUDENT', existingUsers: User[]): string => {
    const prefix = role === 'TEACHER' ? 'TCH' : 'STU';
    
    // Filtrar usuarios por rol
    const roleUsers = existingUsers.filter(user => user.role === role);
    
    // Extraer números de códigos existentes
    const existingNumbers = roleUsers
        .map(user => {
            const match = user.code.match(new RegExp(`${prefix}-(\\d+)`));
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
    
    // Encontrar el número máximo
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    
    // Generar siguiente número con formato de 3 dígitos
    const nextNumber = maxNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}-${formattedNumber}`;
};

/**
 * Obtiene todos los usuarios y genera el siguiente código para un rol
 * @param role - Rol del usuario ('TEACHER' o 'STUDENT')
 * @returns Promesa que resuelve con el código generado
 */
export const generateCodeForRole = async (role: 'TEACHER' | 'STUDENT'): Promise<string> => {
    try {
        const users = await userService.getUsers();
        return generateSequentialCode(role, users);
    } catch (error) {
        console.error('Error al generar código:', error);
        // Fallback: si falla, generar código basado en timestamp
        const prefix = role === 'TEACHER' ? 'TCH' : 'EST';
        const timestamp = Date.now().toString().slice(-3);
        return `${prefix}-${timestamp}`;
    }
};
