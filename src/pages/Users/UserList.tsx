import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import { careerService } from "../../services/careerService";
import { matriculaService, type RegistrationApi, type SearchStudentApi } from "../../services/matriculaService";
import Breadcrumb from "../../components/Breadcrumb";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { getRoleLabel, normalizeRole } from "../../utils/roleUtils";

type CareerOption = {
    id: string;
    name?: string;
    nombre?: string;
    code?: string;
    codigo?: string;
};

const getStudentIdentification = (student: SearchStudentApi): string => {
    return (
        student.identification ||
        student.cedula ||
        student.profile?.identification ||
        ""
    ).trim();
};

const UserList: React.FC = () => {
    const navigate = useNavigate();

    // Estado para la lista de usuarios
    const [users, setUsers] = useState<User[]>([]);
    const [careers, setCareers] = useState<CareerOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para los filtros
    const [filters, setFilters] = useState({
        role: "",
        is_active: "",
        career_id: "",
    });

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
        loadCareers();
    }, []);

    const loadCareers = async () => {
        try {
            const fetchedCareers = await careerService.getCareers();
            setCareers((fetchedCareers as unknown as CareerOption[]) || []);
        } catch {
            setCareers([]);
        }
    };

    /**
     * Obtiene la lista de usuarios
     */
    const loadUsers = async (overrideFilters?: typeof filters) => {
        setLoading(true);
        setError(null);
        const activeFilters = overrideFilters || filters;
        try {
            let baseUsers: User[] = [];

            // Si hay filtros de rol/estado, usar searchUsers
            if (activeFilters.role || activeFilters.is_active !== "") {
                const searchFilters: any = {};
                if (activeFilters.role) searchFilters.role = activeFilters.role;
                if (activeFilters.is_active !== "") {
                    searchFilters.is_active = activeFilters.is_active === "true";
                }

                baseUsers = await userService.searchUsers(searchFilters);
            } else {
                baseUsers = await userService.getUsers();
            }

            // Filtro por carrera_id vía matrículas activas (sin depender de endpoint backend en /users/search)
            if (activeFilters.career_id) {
                const [students, registrationsResponse] = await Promise.all([
                    matriculaService.getStudents(),
                    matriculaService.getRegistrations(),
                ]);

                const registrations: RegistrationApi[] =
                    registrationsResponse?.data?.data || registrationsResponse?.data || [];

                const validStudentIds = new Set(
                    registrations
                        .filter(
                            (registration) =>
                                registration?.career_id === activeFilters.career_id &&
                                registration?.is_active !== false,
                        )
                        .map((registration) => registration.student_id)
                        .filter(Boolean) as string[],
                );

                const validIdentifications = new Set(
                    (students as SearchStudentApi[])
                        .filter((student) => student?.id && validStudentIds.has(student.id))
                        .map((student) => getStudentIdentification(student))
                        .filter(Boolean),
                );

                const usersByCareer = baseUsers.filter((user) => {
                    const identification = (user.profile?.identification || "").trim();
                    return validIdentifications.has(identification);
                });

                setUsers(usersByCareer);
            } else {
                setUsers(baseUsers);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error al obtener usuarios";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja cambios en los filtros
     */
    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    /**
     * Aplica los filtros
     */
    const applyFilters = () => {
        loadUsers();
    };

    /**
     * Limpia los filtros
     */
    const clearFilters = () => {
        const emptyFilters = { role: "", is_active: "", career_id: "" };
        setFilters(emptyFilters);
        setUsers([]);
        loadUsers(emptyFilters);
    };

    /**
     * Navega a la página de edición
     */
    const handleEdit = (userId: string | undefined) => {
        if (!userId) {
            toast.error("ID de usuario inválido");
            return;
        }
        navigate(`/users/update/${userId}`);
    };

    /**
     * Desactiva un usuario
     */
    const handleDeactivate = async (user: User) => {
        if (!user.id) {
            toast.error("ID de usuario inválido");
            return;
        }

        const result = await Swal.fire({
            title: "¿Desactivar usuario?",
            text: `¿Estás seguro de que deseas desactivar a ${user.profile?.first_name || "este usuario"}?`,
            icon: "warning",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "Cancelar",
            buttonsStyling: false,
            customClass: {
                actions: "flex gap-3",
                confirmButton: "rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90",
                cancelButton: "rounded-md border border-stroke px-4 py-2 text-black hover:bg-gray-100 dark:text-white",
            },
        });

        if (result.isConfirmed) {
            try {
                await userService.deactivateUser(user.id);
                toast.success("Usuario desactivado correctamente");
                loadUsers();
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Error al desactivar usuario";
                toast.error(errorMessage);
            }
        }
    };

    /**
     * Activa un usuario
     */
    const handleActivate = async (user: User) => {
        if (!user.id) {
            toast.error("ID de usuario inválido");
            return;
        }

        const result = await Swal.fire({
            title: "¿Activar usuario?",
            text: `¿Deseas activar a ${user.profile?.first_name || "este usuario"}?`,
            icon: "question",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Sí, activar",
            cancelButtonText: "Cancelar",
            buttonsStyling: false,
            customClass: {
                actions: "flex gap-3",
                confirmButton: "rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90",
                cancelButton: "rounded-md border border-stroke px-4 py-2 text-black hover:bg-gray-100 dark:text-white",
            },
        });

        if (result.isConfirmed) {
            try {
                await userService.updateUser(user.id, { is_active: true });
                toast.success("Usuario activado correctamente");
                loadUsers();
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Error al activar usuario";
                toast.error(errorMessage);
            }
        }
    };

    /**
     * Obtiene el color del badge según el rol
     */
    const getRoleBadgeColor = (role: unknown): string => {
        switch (normalizeRole(role)) {
            case "ADMIN":
                return "bg-red-500 text-black dark:text-white";
            case "TEACHER":
                return "bg-blue-500 text-black dark:text-white";
            case "STUDENT":
                return "bg-green-500 text-black dark:text-white";
            default:
                return "bg-gray-500 text-black dark:text-white";
        }
    };

    /**
     * Obtiene el color del badge según el estado
     */
    const getStatusBadgeColor = (is_active?: boolean): string => {
        return is_active ? "bg-success text-white" : "bg-meta-1 text-white";
    };

    return (
        <>
            <Breadcrumb pageName="Gestión de Usuarios" />

            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                {/* Encabezado con botón crear */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-title-md2 font-bold text-black dark:text-white">
                        Usuarios
                    </h2>
                    <button
                        onClick={() => navigate("/users/create")}
                        className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                    >
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Crear Usuario
                    </button>
                </div>

                {/* Sección de Filtros */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-meta-4 rounded-sm border border-stroke dark:border-strokedark">
                    <h3 className="mb-4 text-sm font-medium text-black dark:text-white">
                        Filtros
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Filtro por Rol */}
                        <div>
                            <label className="mb-2.5 block text-black dark:text-white">
                                Rol
                            </label>
                            <select
                                value={filters.role}
                                onChange={(e) => handleFilterChange("role", e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Todos los roles</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="TEACHER">Docente</option>
                                <option value="STUDENT">Estudiante</option>
                            </select>
                        </div>

                        {/* Filtro por Estado */}
                        <div>
                            <label className="mb-2.5 block text-black dark:text-white">
                                Estado
                            </label>
                            <select
                                value={filters.is_active}
                                onChange={(e) => handleFilterChange("is_active", e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2.5 block text-black dark:text-white">
                                Carrera
                            </label>
                            <select
                                value={filters.career_id}
                                onChange={(e) => handleFilterChange("career_id", e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Todas las carreras</option>
                                {careers.map((career) => {
                                    const name = career.name || career.nombre || "Sin nombre";
                                    const code = career.code || career.codigo;
                                    return (
                                        <option key={career.id} value={career.id}>
                                            {code ? `${name} (${code})` : name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Botones de acción de filtros */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={applyFilters}
                            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center rounded-md border border-stroke py-2 px-6 text-center font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-red-600">
                        {error}
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No hay usuarios disponibles
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#eee] dark:border-strokedark">
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Código
                                    </th>
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Email
                                    </th>
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Nombre
                                    </th>
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Rol
                                    </th>
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Estado
                                    </th>
                                    <th className="px-4 py-5 font-medium text-black dark:text-white">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const role = user.role;

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-[#eee] dark:border-strokedark"
                                        >
                                            <td className="px-4 py-5 text-black dark:text-white">
                                                {user.code}
                                            </td>
                                            <td className="px-4 py-5 text-black dark:text-white">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-5 text-black dark:text-white">
                                                {user.profile
                                                    ? `${user.profile.first_name || ""} ${user.profile.last_name || ""}`.trim() || "-"
                                                    : normalizeRole(user.role) === "ADMIN"
                                                        ? "ADMIN"
                                                        : "-"}
                                            </td>
                                            <td className="px-4 py-5">
                                                <span
                                                    className={`inline-block rounded-full py-1 px-3 text-sm font-medium ${getRoleBadgeColor(
                                                        role
                                                    )}`}
                                                >
                                                    {getRoleLabel(role)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span
                                                    className={`inline-block rounded-full py-1 px-3 text-sm font-medium ${getStatusBadgeColor(
                                                        user.is_active
                                                    )}`}
                                                >
                                                    {user.is_active ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleEdit(user.id)}
                                                        className="inline-flex items-center justify-center rounded-md bg-meta-3 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
                                                        title="Editar usuario"
                                                    >
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {user.is_active && (
                                                        <button
                                                            onClick={() => handleDeactivate(user)}
                                                            className="inline-flex items-center justify-center rounded-md bg-meta-1 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
                                                            title="Desactivar usuario"
                                                        >
                                                            <svg
                                                                className="h-5 w-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {!user.is_active && (
                                                        <button
                                                            onClick={() => handleActivate(user)}
                                                            type="button"
                                                            title="Activar usuario"
                                                            style={{
                                                                backgroundColor: "#15803d",
                                                                color: "#ffffff",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                padding: "8px 16px",
                                                                cursor: "pointer",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            Activar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Resumen */}
                {!loading && users.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Total de usuarios: <strong>{users.length}</strong>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserList;
