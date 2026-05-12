import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { PlanEstudio } from "../../../models/PlanEstudio";
import { studyPlanService } from "../../../services/studyPlanService";
import { careerService } from "../../../services/careerService";
import { asignaturaService } from "../../../services/asignaturaService";

const StudyPlanList: React.FC = () => {
    const navigate = useNavigate();
    const [studyPlans, setStudyPlans] = useState<PlanEstudio[]>([]);
    const [careers, setCareers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filtros
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [showVersions, setShowVersions] = useState<boolean>(false);

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

    useEffect(() => {
        loadCareers();
    }, []);

    useEffect(() => {
        loadStudyPlans();
    }, [selectedCareer, selectedVersion, showVersions]);

    const filteredPlans = useMemo(() => {
        let filtered = studyPlans;
        
        if (selectedVersion) {
            filtered = filtered.filter(plan => {
                const version = (plan as any).version || (plan as any).year;
                return version.toString() === selectedVersion;
            });
        }
        
        return filtered.sort((a, b) => {
            const versionA = (a as any).version || (a as any).year;
            const versionB = (b as any).version || (b as any).year;
            return versionB - versionA;
        });
    }, [studyPlans, selectedVersion]);

    const handleAddSubject = async () => {
        if (!selectedCareer) {
            toast.error("Por favor seleccione una carrera primero");
            return;
        }
        
        const { value: formValues } = await Swal.fire({
            title: "Agregar Asignatura al Plan de Estudios",
            html: `
                <div style="text-align: left; margin: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Asignatura:</label>
                        <select id="subject-select" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Seleccione una asignatura...</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Semestre Sugerido:</label>
                        <input type="number" id="semester-input" min="1" max="10" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Créditos:</label>
                        <input type="number" id="credits-input" min="1" max="10" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Agregar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const subjectSelect = (document.getElementById('subject-select') as HTMLSelectElement);
                const semesterInput = (document.getElementById('semester-input') as HTMLInputElement);
                const creditsInput = (document.getElementById('credits-input') as HTMLInputElement);
                
                if (!subjectSelect.value) {
                    Swal.showValidationMessage('Por favor seleccione una asignatura');
                    return false;
                }
                
                return {
                    asignatura_id: subjectSelect.value,
                    semestre_sugerido: parseInt(semesterInput.value),
                    creditos: parseInt(creditsInput.value)
                };
            }
        });

        if (formValues) {
            try {
                await studyPlanService.addSubjectToStudyPlan(selectedCareer, formValues);
                toast.success("Asignatura agregada exitosamente");
                loadStudyPlans();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Error al agregar asignatura");
            }
        }
    };

    const handleRemoveSubject = async (plan: PlanEstudio) => {
        const result = await Swal.fire({
            title: "¿Remover asignatura del plan de estudios?",
            text: `Se removerá ${plan.nombre} del plan de estudios`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, remover",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await studyPlanService.removeSubjectFromStudyPlan(plan.id);
                toast.success("Asignatura removida exitosamente");
                loadStudyPlans();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Error al remover asignatura");
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
        });

        if (result.isConfirmed) {
            try {
                await studyPlanService.createNewVersion(selectedCareer);
                toast.success("Nueva versión creada exitosamente");
                setShowVersions(true);
                loadStudyPlans();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Error al crear nueva versión");
            }
        }
    };

    const getVersionOptions = useMemo(() => {
        const versions = new Set(studyPlans.map(plan => {
            const version = (plan as any).version || (plan as any).year || 1;
            return version;
        }));
        return Array.from(versions).sort((a, b) => b - a);
    }, [studyPlans]);

    // Cargar asignaturas dinámicamente
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const subjects = await asignaturaService.getAsignaturas();
                const select = document.getElementById('subject-select') as HTMLSelectElement;
                if (select) {
                    select.innerHTML = '<option value="">Seleccione una asignatura...</option>';
                    subjects.forEach((subject: any) => {
                        const option = document.createElement('option');
                        option.value = subject.id;
                        option.textContent = subject.nombre;
                        select.appendChild(option);
                    });
                }
            } catch (error) {
                console.error("Error al cargar asignaturas:", error);
            }
        };

        // Solo cargar si el modal está abierto
        const checkForModal = setInterval(() => {
            const select = document.getElementById('subject-select') as HTMLSelectElement;
            if (select && select.options.length <= 1) {
                loadSubjects();
            }
        }, 500);

        return () => clearInterval(checkForModal);
    }, []);

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
                                onClick={handleAddSubject}
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
                                                        {plan.nombre}
                                                    </div>
                                                    {plan.asignatura && 'code' in plan.asignatura && (
                                                        <div className="text-sm text-gray-500">
                                                            Código: {(plan.asignatura as any).code || (plan.asignatura as any).codigo}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                    {plan.semestre_sugerido}° semestre
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {plan.creditos} créditos
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    (plan as any).is_published 
                                                        ? 'bg-success/10 text-success' 
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    v{(plan as any).version || (plan as any).year}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    (plan as any).is_published 
                                                        ? 'bg-success/10 text-success' 
                                                        : 'bg-warning/10 text-warning'
                                                }`}>
                                                    {(plan as any).is_published ? 'Activo' : 'Inactivo'}
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
