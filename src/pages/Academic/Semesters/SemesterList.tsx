import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { Semester } from "../../../models/Semester";
import { semesterService } from "../../../services/semesterService";

const SemesterList: React.FC = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const loadData = async () => {
        setLoading(true);
        try {
            const semesterItems = await semesterService.getSemesters();
            setSemesters(semesterItems);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al obtener semestres");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredSemesters = useMemo(() => {
        return semesters.filter((semester) => {
            return statusFilter === "" ? true : semester.is_active === (statusFilter === "true");
        });
    }, [semesters, statusFilter]);

    const handleToggleSemester = async (semester: Semester) => {
        const isOpen = semester.is_active;

        const result = await Swal.fire({
            title: isOpen ? "¿Cerrar semestre?" : "¿Abrir semestre?",
            text: isOpen
                ? `Se cerrará ${semester.name}`
                : `Se abrirá ${semester.name}. Todos los demás semestres activos se cerrarán automáticamente.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isOpen ? "Sí, cerrar" : "Sí, abrir",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            if (isOpen) {
                await semesterService.closeSemester(semester.id);
                toast.success("Semestre cerrado correctamente");
            } else {
                // Close all other active semesters first
                const activeSemesters = semesters.filter(s => s.is_active && s.id !== semester.id);
                for (const activeSemester of activeSemesters) {
                    await semesterService.closeSemester(activeSemester.id);
                }
                // Then activate the selected semester
                await semesterService.updateSemester(semester.id, { is_active: true });
                toast.success("Semestre abierto correctamente");
            }

            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "No fue posible actualizar el semestre");
        }
    };

    return (
        <>
            <Breadcrumb pageName="Semestres" />
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-title-md2 font-bold text-black dark:text-white">Gestión de Semestres</h2>
                        <p className="text-sm text-body">Crear, editar y cerrar semestres académicos.</p>
                    </div>
                    <button
                        onClick={() => navigate("/academic/semesters/create")}
                        className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                    >
                        Crear semestre
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4 md:grid-cols-2 md:max-w-2xl">
                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Estado</label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                            <option value="">Todos</option>
                            <option value="true">Activos</option>
                            <option value="false">Cerrados</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                        <thead>
                            <tr className="text-left text-sm font-medium text-black dark:text-white">
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Inicio</th>
                                <th className="px-4 py-3">Fin</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td className="px-4 py-5" colSpan={6}>Cargando...</td>
                                </tr>
                            )}
                            {!loading && filteredSemesters.length === 0 && (
                                <tr>
                                    <td className="px-4 py-5" colSpan={6}>No hay semestres registrados.</td>
                                </tr>
                            )}
                            {!loading && filteredSemesters.map((semester) => (
                                <tr key={semester.id} className="border-t border-stroke text-sm dark:border-strokedark">
                                    <td className="px-4 py-5 text-black dark:text-white">{semester.name}</td>
                                    <td className="px-4 py-5 text-black dark:text-white">{semester.code}</td>
                                    <td className="px-4 py-5 text-black dark:text-white">{semester.start_date.slice(0, 10)}</td>
                                    <td className="px-4 py-5 text-black dark:text-white">{semester.end_date.slice(0, 10)}</td>
                                    <td className="px-4 py-5">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${semester.is_active ? "bg-success text-white" : "bg-meta-1 text-white"}`}>
                                            {semester.is_active ? "Activo" : "Cerrado"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => navigate(`/academic/semesters/update/${semester.id}`)}
                                                className="rounded-md border border-primary px-3 py-2 text-primary hover:bg-primary hover:text-white"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleSemester(semester)}
                                                className={`rounded-md px-3 py-2 font-medium text-white transition-colors ${
                                                    semester.is_active
                                                        ? "border border-meta-1 bg-meta-1 hover:bg-meta-1/90"
                                                        : "border border-success bg-success hover:bg-success/90 dark:bg-success dark:hover:bg-success/80"
                                                }`}
                                            >
                                                {semester.is_active ? "Cerrar semestre" : "Abrir semestre"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SemesterList;
