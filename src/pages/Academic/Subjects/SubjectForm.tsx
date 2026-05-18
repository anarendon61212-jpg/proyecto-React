import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { asignaturaService } from "../../../services/asignaturaService";

const SubjectForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        credits: 1,
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingCodes, setExistingCodes] = useState<string[]>([]);

    useEffect(() => {
        const loadExistingCodes = async () => {
            try {
                const subjects = await asignaturaService.getAsignaturas();
                setExistingCodes(subjects.map(s => s.code));
            } catch (error) {
                console.error("Error al cargar códigos existentes:", error);
            }
        };

        const loadSubject = async () => {
            if (id) {
                setLoading(true);
                try {
                    const subject = await asignaturaService.getAsignaturaById(id);
                    if (subject) {
                        setFormData({
                            name: subject.name || "",
                            code: subject.code || "",
                            description: subject.description || "",
                            credits: subject.credits || 1,
                            is_active: subject.is_active ?? true,
                        });
                    }
                } catch (error: any) {
                    setError(error.response?.data?.message || "Error al cargar asignatura");
                    toast.error("Error al cargar asignatura");
                } finally {
                    setLoading(false);
                }
            }
        };

        loadExistingCodes();
        loadSubject();
    }, [id]);

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            toast.error("El nombre es requerido");
            return false;
        }

        if (!formData.code.trim()) {
            toast.error("El código es requerido");
            return false;
        }

        // Validar formato del código (alphanumeric y guiones bajos)
        if (!/^[a-zA-Z0-9_-]+$/.test(formData.code)) {
            toast.error("El código solo puede contener letras, números, guiones y guiones bajos");
            return false;
        }

        // Validar código único (excepto en modo edición)
        if (!isEditing && existingCodes.includes(formData.code.toUpperCase())) {
            toast.error("Ya existe una asignatura con este código");
            return false;
        }

        if (!formData.description.trim()) {
            toast.error("La descripción es requerida");
            return false;
        }

        if (formData.credits < 1 || formData.credits > 10) {
            toast.error("Los créditos deben estar entre 1 y 10");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const subjectData = {
                ...formData,
                name: formData.name.trim(),
                code: formData.code.toUpperCase().trim(),
                description: formData.description.trim(),
            };

            if (isEditing && id) {
                await asignaturaService.updateAsignatura(id, subjectData);
                toast.success("Asignatura actualizada exitosamente");
            } else {
                await asignaturaService.createAsignatura(subjectData);
                toast.success("Asignatura creada exitosamente");
            }

            navigate("/academic/subjects");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 
                (isEditing ? "Error al actualizar asignatura" : "Error al crear asignatura");
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "code") {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else if (name === "credits") {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 1
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleCancel = () => {
        navigate("/academic/subjects");
    };

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName={isEditing ? "Editar Asignatura" : "Nueva Asignatura"} />
            
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        {isEditing ? "Editar Asignatura" : "Nueva Asignatura"}
                    </h3>
                </div>

                <div className="p-6.5">
                    {error && (
                        <div className="mb-4 rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Nombre de la Asignatura <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Ej: Programación Orientada a Objetos"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Código */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Código <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="Ej: PROG101"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                disabled={loading || isEditing}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {!isEditing && "El código debe ser único. Solo letras, números, guiones y guiones bajos."}
                                {isEditing && "El código no se puede modificar."}
                            </p>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe el contenido y objetivos de la asignatura..."
                                rows={4}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white resize-none"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Créditos */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Número de Créditos <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="credits"
                                value={formData.credits}
                                onChange={handleInputChange}
                                min="1"
                                max="10"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                disabled={loading}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Los créditos deben estar entre 1 y 10
                            </p>
                        </div>

                        {/* Estado (solo en modo edición) */}
                        {isEditing && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    Estado
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleCheckboxChange}
                                        className="rounded border-stroke"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-black dark:text-white">
                                        Asignatura activa
                                    </span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Las asignaturas inactivas no pueden asociarse a nuevos grupos ni planes de estudio
                                </p>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {isEditing ? "Actualizando..." : "Creando..."}
                                    </span>
                                ) : (
                                    isEditing ? "Actualizar Asignatura" : "Crear Asignatura"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 rounded border border-stroke bg-gray-100 px-6 py-3 text-black transition-colors hover:bg-gray-200 dark:border-strokedark dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubjectForm;
