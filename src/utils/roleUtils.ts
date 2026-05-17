export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

const ROLE_ALIASES: Record<string, UserRole> = {
    ADMIN: "ADMIN",
    ADMINISTRADOR: "ADMIN",
    TEACHER: "TEACHER",
    DOCENTE: "TEACHER",
    PROFESOR: "TEACHER",
    STUDENT: "STUDENT",
    ESTUDIANTE: "STUDENT",
    ALUMNO: "STUDENT",
};

export const normalizeRole = (value: unknown): UserRole | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    const normalized = value.trim().toUpperCase();
    return ROLE_ALIASES[normalized];
};

export const extractRoleFromObject = (value: unknown): UserRole | undefined => {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    const candidate = value as any;

    const roleCandidates: unknown[] = [
        candidate.role,
        candidate.role?.name,
        candidate.role?.value,

        candidate.rol,
        candidate.user_role,
        candidate.userRole,
        candidate.type_user,
        candidate.user_type,

        candidate.profile?.role,
        candidate.profile?.role?.name,
    ];

    if (Array.isArray(candidate.roles) && candidate.roles.length > 0) {
        roleCandidates.push(candidate.roles[0]);
        roleCandidates.push(candidate.roles[0]?.name);
    }

    for (const roleCandidate of roleCandidates) {
        const normalizedRole = normalizeRole(roleCandidate);

        if (normalizedRole) {
            return normalizedRole;
        }
    }

    return undefined;
};

export const isAdminRole = (value: unknown): boolean => {
    return normalizeRole(value) === "ADMIN";
};

export const getRoleLabel = (value: unknown): string => {
    const normalizedRole = normalizeRole(value);

    switch (normalizedRole) {
        case "ADMIN":
            return "Administrador";
        case "TEACHER":
            return "Docente";
        case "STUDENT":
            return "Estudiante";
        default:
            return "Sin rol";
    }
};
