import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { PlanEstudio } from "../../../models/PlanEstudio";
import { studyPlanService } from "../../../services/studyPlanService";
import { careerService } from "../../../services/careerService";
import { asignaturaService } from "../../../services/asignaturaService";

const STUDY_PLAN_CREDITS_KEY = "study-plan-credits-overrides";

const readCreditsOverrides = (): Record<string, number> => {
    try {
        const stored = localStorage.getItem(STUDY_PLAN_CREDITS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const StudyPlanList: React.FC = () => {
    const navigate = useNavigate();
    const [studyPlans, setStudyPlans] = useState<PlanEstudio[]>([]);
    const [planSubjectsById, setPlanSubjectsById] = useState<Record<string, any[]>>({});
    const [careers, setCareers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filtros
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [showVersions, setShowVersions] = useState<boolean>(false);
    const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [addSubjectData, setAddSubjectData] = useState({
        asignatura_id: "",
        semestre_sugerido: 1,
        creditos: 1,
    });
    const creditsOverrides = useMemo(() => readCreditsOverrides(), []);

    const resetAddSubjectData = () => {
        setAddSubjectData({
            asignatura_id: "",
            semestre_sugerido: 1,
            creditos: 1,
        });
    };

    const loadStudyPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            let plans: PlanEstudio[] = [];
            
            if (selectedCareer) {
                if (showVersions) {
                    plans = await studyPlanService.getStudyPlanVersions(selectedCareer);
                } else {
                    plans = await studyPlanService.getActiveStudyPlansByCareer(selectedCareer);
                }
            } else {
                plans = await studyPlanService.getStudyPlans();
            }
            
            setStudyPlans(plans);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error al obtener planes de estudio";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loadCareers = async () => {
        try {
            const careersData = await careerService.getCareers();
            setCareers(careersData);
        } catch (err: any) {
            toast.error("Error al cargar carreras");
        }
    };

    const loadSubjects = async () => {
        try {
            const subjectsData = await asignaturaService.getAsignaturas();
            setSubjects(subjectsData);
        } catch (error) {
            console.error("Error al cargar asignaturas:", error);
        }
    };

    useEffect(() => {
        loadCareers();
        loadSubjects();
    }, []);

    useEffect(() => {
        loadStudyPlans();
    }, [selectedCareer, selectedVersion, showVersions]);

    useEffect(() => {
        const loadPlanSubjects = async () => {
            if (studyPlans.length === 0) {
                setPlanSubjectsById({});
                return;
            }

            const results = await Promise.all(
                studyPlans.map(async (plan) => {
                    try {
                        const relatedSubjects = await studyPlanService.getSubjectsByStudyPlan(plan.id);
                        return [plan.id, Array.isArray(relatedSubjects) ? relatedSubjects : []] as const;
                    } catch {
                        return [plan.id, []] as const;
                    }
                })
            );

            setPlanSubjectsById(Object.fromEntries(results));
        };

        loadPlanSubjects();
    }, [studyPlans]);

    const filteredPlans = useMemo(() => {
        let filtered = studyPlans;
        
        if (selectedVersion) {
            filtered = filtered.filter(plan => {
                const version = plan.year;
                return version.toString() === selectedVersion;
            });
        }
        
        return filtered.sort((a, b) => {
            const versionA = a.year;
            const versionB = b.year;
            return versionB - versionA;
        });
    }, [studyPlans, selectedVersion]);

    const resolvePlanSubject = (plan: PlanEstudio) => {
        const relatedSubjects = planSubjectsById[plan.id] || [];

        if (relatedSubjects.length > 0) {
            return relatedSubjects[0];
        }

        return null;
    };

    const resolvePlanName = (plan: PlanEstudio) => {
        const relatedSubject = resolvePlanSubject(plan);

        return relatedSubject?.nombre || relatedSubject?.name || plan.name || "Sin asignatura";
    };

    const resolvePlanCode = (plan: PlanEstudio) => {
        const relatedSubject = resolvePlanSubject(plan);

        return relatedSubject?.codigo || relatedSubject?.code || null;
    };

    const resolvePlanSemester = (plan: PlanEstudio) => {
        if (plan.suggested_semester !== undefined && plan.suggested_semester !== null) {
            return plan.suggested_semester;
        }

        return null;
    };

    const resolvePlanCredits = (plan: PlanEstudio) => {
        const override = creditsOverrides[plan.id];

        if (override !== undefined && override !== null) {
            return override;
        }

        return null;
    };

    const handleOpenAddSubject = () => {
        if (!selectedCareer) {
            toast.error("Por favor seleccione una carrera primero");
            return;
        }
        setShowAddSubjectModal(true);
    };

    const handleCloseAddSubject = () => {
        setShowAddSubjectModal(false);
        resetAddSubjectData();
    };

    const handleAddSubjectChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setAddSubjectData(prev => ({
            ...prev,
            [name]: name === "asignatura_id" ? value : parseInt(value, 10) || 0,
        }));
    };

    const handleSubmitAddSubject = async () => {
        if (!addSubjectData.asignatura_id) {
            toast.error("Por favor seleccione una asignatura");
            return;
        }

        if (!selectedCareer) {
            toast.error("Por favor seleccione una carrera primero");
            return;
        }

        if (addSubjectData.semestre_sugerido < 1 || addSubjectData.semestre_sugerido > 10) {
            toast.error("El semestre sugerido debe estar entre 1 y 10");
            return;
        }

        if (addSubjectData.creditos < 1 || addSubjectData.creditos > 10) {
            toast.error("Los créditos deben estar entre 1 y 10");
            return;
        }

        try {
            // Obtener el plan de estudio activo de la carrera
            const activePlans = await studyPlanService.getActiveStudyPlansByCareer(selectedCareer);
            
            if (activePlans.length === 0) {
                toast.error("No hay un plan de estudio activo para esta carrera");
                return;
            }

            const studyPlanId = activePlans[0].id;
            
            await studyPlanService.addSubjectToStudyPlan(
                studyPlanId,
                addSubjectData.asignatura_id,
                {
                    suggested_semester: addSubjectData.semestre_sugerido,
                    credits: addSubjectData.creditos
                }
            );
            toast.success("Asignatura agregada exitosamente");
            handleCloseAddSubject();
            loadStudyPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || "Error al agregar asignatura");
        }
    };

    const handleRemoveSubject = async (plan: PlanEstudio) => {
        const relatedSubject = resolvePlanSubject(plan);
        
        if (!relatedSubject) {
            toast.error("No se encontró la asignatura asociada");
            return;
        }

        const result = await Swal.fire({
            title: "¿Remover asignatura del plan de estudios?",
            text: `Se removerá ${resolvePlanName(plan)} del plan de estudios`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, remover",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await studyPlanService.removeSubjectFromStudyPlan(plan.id, relatedSubject.id);
                toast.success("Asignatura removida exitosamente");
                loadStudyPlans();
            } catch (error: any) {
                toast.error(error.response?.data?.message || error.message || "Error al remover asignatura");
            }
        }
    };

    const handleCreateNewVersion = async () => {
        if (!selectedCareer) {
            toast.error("Por favor seleccione una carrera primero");
            return;
        }

        const result = await Swal.fire({
            title: "¿Crear nueva versión del plan de estudios?",
            text: "Esto creará una nueva versión del plan de estudios. Los cambios aplicarán solo a nuevas cohortes.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, crear",
            cancelButtonText: "Cancelar",
            customClass: {
                confirmButton: "swal2-confirm-button",
                cancelButton: "swal2-cancel-button"
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const newVersion = await studyPlanService.createNewVersion(selectedCareer);
                toast.success(`Nueva versión ${newVersion.year} creada exitosamente`);
                setShowVersions(true);
                loadStudyPlans();
            } catch (error: any) {
                toast.error(error.response?.data?.message || error.message || "Error al crear nueva versión");
            }
        }
    };

    const getVersionOptions = useMemo(() => {
        const versions = new Set(studyPlans.map(plan => {
            return plan.year || 1;
        }));
        return Array.from(versions).sort((a, b) => b - a);
    }, [studyPlans]);

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName="Planes de Estudio" />
            
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Gestión de Planes de Estudio
                    </h3>
                </div>

                <div className="p-6.5">
                    {/* Filtros */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Carrera
                            </label>
                            <select
                                value={selectedCareer}
                                onChange={(e) => setSelectedCareer(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >
                                <option value="">Todas las carreras</option>
                                {careers.map((career) => (
                                    <option key={career.id} value={career.id}>
                                        {career.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Versión
                            </label>
                            <select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >
                                <option value="">Todas las versiones</option>
                                {getVersionOptions.map((version) => (
                                    <option key={version} value={version?.toString() || '1'}>
                                        Versión {version}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={() => setShowVersions(!showVersions)}
                                className={`px-4 py-3 rounded-md font-medium ${
                                    showVersions 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'
                                }`}
                            >
                                {showVersions ? 'Ver Activos' : 'Ver Historial'}
                            </button>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    {selectedCareer && (
                        <div className="mb-6 flex gap-2">
                            <button
                                onClick={handleOpenAddSubject}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Agregar Asignatura
                            </button>
                            <button
                                onClick={handleCreateNewVersion}
                                className="px-4 py-2 bg-meta-3 text-white rounded-md hover:bg-meta-3/90 transition-colors"
                            >
                                Crear Nueva Versión
                            </button>
                        </div>
                    )}

                    {showAddSubjectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-boxdark">
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-black dark:text-white">Agregar Asignatura</h4>
                                    <button
                                        onClick={handleCloseAddSubject}
                                        className="text-black transition hover:text-gray-500 dark:text-white dark:hover:text-gray-300"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Asignatura</label>
                                        <select
                                            name="asignatura_id"
                                            value={addSubjectData.asignatura_id}
                                            onChange={handleAddSubjectChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        >
                                            <option value="">Seleccione una asignatura...</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Semestre sugerido</label>
                                        <input
                                            type="number"
                                            name="semestre_sugerido"
                                            min={1}
                                            max={10}
                                            value={addSubjectData.semestre_sugerido}
                                            onChange={handleAddSubjectChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">Créditos</label>
                                        <input
                                            type="number"
                                            name="creditos"
                                            min={1}
                                            max={10}
                                            value={addSubjectData.creditos}
                                            onChange={handleAddSubjectChange}
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={handleCloseAddSubject}
                                        className="rounded border border-stroke bg-gray-100 px-5 py-2 text-black transition hover:bg-gray-200 dark:border-form-strokedark dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmitAddSubject}
                                        className="rounded bg-primary px-5 py-2 text-white transition hover:bg-primary/90"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabla de planes de estudio */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="text-lg">Cargando...</div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center py-8">
                            <div className="text-red-500">{error}</div>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="text-gray-500">
                                {selectedCareer 
                                    ? "No hay planes de estudio para esta carrera" 
                                    : "No hay planes de estudio registrados"}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 dark:bg-meta-4 text-left dark:bg-meta-4">
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Asignatura
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Semestre
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Créditos
                                        </th>
                                        <th className="px-4 py-3 font-medium text-black dark:text-white">
                                            Versión
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
                                    {filteredPlans.map((plan) => (
                                        <tr key={plan.id} className="border-b border-stroke dark:border-strokedark">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium text-black dark:text-white">
                                                        {resolvePlanName(plan)}
                                                    </div>
                                                    {resolvePlanCode(plan) && (
                                                        <div className="text-sm text-gray-500">
                                                            Código: {resolvePlanCode(plan)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                    {resolvePlanSemester(plan) !== null
                                                        ? `Semestre ${String(resolvePlanSemester(plan))}`
                                                        : "Sin semestre"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {resolvePlanCredits(plan) !== null
                                                        ? `${String(resolvePlanCredits(plan))} créditos`
                                                        : "Sin créditos"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    plan.is_published 
                                                        ? 'bg-success/10 text-success' 
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    Versión {plan.year}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    plan.is_published 
                                                        ? 'bg-success/10 text-success' 
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    {plan.is_published ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/academic/study-plans/edit/${plan.id}`)}
                                                        className="text-primary hover:text-primary/80"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L15.828 15H18v-2.172l-7.586-7.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveSubject(plan)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Remover"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

export default StudyPlanList;
