import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { Asignatura } from "../../../models/Asignatura";
import { asignaturaService } from "../../../services/asignaturaService";
import { grupoService } from "../../../services/grupoService";
import { finalGradeService } from "../../../services/finalGradeService";

const SubjectList: React.FC = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Asignatura[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
    const [creditsFilter, setCreditsFilter] = useState<string>("");

    const loadSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await asignaturaService.getAsignaturas();
            setSubjects(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error al obtener asignaturas";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const filteredSubjects = useMemo(() => {
        let filtered = [...subjects];

        if (statusFilter !== "all") {
            filtered = filtered.filter(subject =>
                statusFilter === "active" ? subject.is_active : !subject.is_active
            );
        }

        if (creditsFilter.trim()) {
            const creditsValue = Number(creditsFilter);
            if (!Number.isNaN(creditsValue)) {
                filtered = filtered.filter(subject => Number(subject.credits) === creditsValue);
            }
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(subject =>
                subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [subjects, searchTerm, statusFilter, creditsFilter]);

    const handleCreate = () => {
        navigate("/academic/subjects/create");
    };

    const handleEdit = (subject: Asignatura) => {
        navigate(`/academic/subjects/edit/${subject.id}`);
    };

    const isEnrollmentActive = (enrollment: any) => {
        const rawStatus = enrollment?.status;
        if (typeof rawStatus === 'boolean') return rawStatus;
        if (rawStatus === null || rawStatus === undefined || rawStatus === '') return true;
        const normalized = String(rawStatus).trim().toUpperCase();
        return ['ACTIVE', 'ACTIVO', 'ENROLLED', 'MATRICULADO', 'A', '1'].includes(normalized);
    };

    const handleToggleActive = async (subject: Asignatura) => {
        const action = subject.is_active ? "archivar" : "activar";
        const result = await Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} asignatura?`,
            text: `¿Estás seguro de que quieres ${action} la asignatura "${subject.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                // Si vamos a archivar, comprobar si existen grupos o inscripciones activas que lo impidan
                if (subject.is_active) {
                    const gruposResp = await grupoService.getGrupos();
                    const gruposData = (gruposResp?.data?.data || gruposResp?.data || []) as any[];
                    const subjectGroups = gruposData.filter(g => (g.asignatura_id || g.subject_id) === subject.id);

                    if (subjectGroups.length > 0) {
                        // Comprobar inscripciones activas en cada grupo
                        const checks = await Promise.all(subjectGroups.map(async (g) => {
                            try {
                                const enrollments = await finalGradeService.getEnrollmentsByGroupId(g.id);
                                const active = (enrollments || []).filter(isEnrollmentActive);
                                return { group: g, activeEnrollments: active };
                            } catch (e) {
                                return { group: g, activeEnrollments: [] };
                            }
                        }));

                        const blocking = checks.filter(c => (c.activeEnrollments || []).length > 0);
                        if (blocking.length > 0) {
                            // Mostrar detalle al usuario y abortar
                            const details = blocking.map(b => `Grupo: ${b.group.nombre || b.group.name || b.group.codigo_grupo || b.group.group_code || b.group.id} — Inscripciones activas: ${b.activeEnrollments.length}`).join('\n');
                            await Swal.fire({
                                icon: 'error',
                                title: 'No se puede archivar la asignatura',
                                html: `<pre style="text-align:left; white-space:pre-wrap;">${details}</pre>`,
                                confirmButtonText: 'Entendido'
                            });
                            setLoading(false);
                            return;
                        }
                    }
                }

                await asignaturaService.updateAsignatura(subject.id, {
                    is_active: !subject.is_active
                });
                toast.success(`Asignatura ${action === "archivar" ? "archivada" : "activada"} exitosamente`);
                loadSubjects();
            } catch (error: any) {
                // Mejor manejo de errores: si el backend devuelve HTML (500), mostrar mensaje genérico y el status
                const respData = error?.response?.data;
                const status = error?.response?.status;
                let message = error?.response?.data?.message || error?.message || `Error al ${action} asignatura`;
                if (typeof respData === 'string' && respData.includes('<!DOCTYPE')) {
                    message = `El servidor respondió con un error (${status}). Revisa los logs del backend.`;
                }
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName="Asignaturas" />
            
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Gestión de Asignaturas
                    </h3>
                </div>

                <div className="p-6.5">
                    {/* Controles de búsqueda y filtros */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Buscar
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, código o descripción..."
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>

                        <div className="min-w-[180px]">
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Estado
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >
                                <option value="all">Todas</option>
                                <option value="active">Activas</option>
                                <option value="inactive">Archivadas</option>
                            </select>
                        </div>

                        <div className="min-w-[180px]">
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Créditos
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={creditsFilter}
                                onChange={(e) => setCreditsFilter(e.target.value)}
                                placeholder="Ej: 3"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleCreate}
                                className="px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Nueva Asignatura
                            </button>
                        </div>
                    </div>

                    {/* Tabla de asignaturas */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="text-lg">Cargando...</div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center py-8">
                            <div className="text-red-500">{error}</div>
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="text-gray-500">
                                {searchTerm 
                                    ? "No se encontraron asignaturas que coincidan con la búsqueda" 
                                    : "No hay asignaturas registradas"}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 dark:bg-meta-4 text-left dark:bg-meta-4">
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Código
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Nombre
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Descripción
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Créditos
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.map((subject) => (
                                        <tr key={subject.id} className="border-b border-stroke dark:border-strokedark">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-primary">
                                                    {subject.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-black dark:text-white">
                                                        {subject.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400" title={subject.description}>
                                                    {subject.description}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                    {subject.credits} créditos
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    subject.is_active 
                                                        ? 'bg-success/10 text-success' 
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    {subject.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(subject)}
                                                        className="text-primary hover:text-primary/80"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L15.828 15H18v-2.172l-7.586-7.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(subject)}
                                                        className={`${
                                                            subject.is_active 
                                                                ? 'text-warning hover:text-warning/80' 
                                                                : 'text-success hover:text-success/80'
                                                        }`}
                                                        title={subject.is_active ? 'Archivar' : 'Activar'}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {subject.is_active ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8M9 15h6m-6-4h6" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm6-4V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
                                                            )}
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectList;
