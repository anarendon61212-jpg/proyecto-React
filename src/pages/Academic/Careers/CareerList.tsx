import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { Career } from "../../../models/Career";
import { careerService } from "../../../services/careerService";

const CareerList: React.FC = () => {
    const navigate = useNavigate();
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const loadCareers = async () => {
        setLoading(true);
        try {
            const items = await careerService.getCareers();
            setCareers(items);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al obtener carreras");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCareers();
    }, []);

    const filteredCareers = useMemo(() => {
        if (statusFilter === "") return careers;
        const isActive = statusFilter === "true";
        return careers.filter((career) => career.is_active === isActive);
    }, [careers, statusFilter]);

    const handleArchive = async (career: Career) => {
        const result = await Swal.fire({
            title: "¿Archivar carrera?",
            text: `Se archivará ${career.name}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, archivar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            await careerService.archiveCareer(career.id);
            toast.success("Carrera archivada correctamente");
            loadCareers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "No fue posible archivar la carrera");
        }
    };

    const handleUnarchive = async (career: Career) => {
        const result = await Swal.fire({
            title: "¿Desarchivar carrera?",
            text: `Se reactivará ${career.name}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, desarchivar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            await careerService.updateCareer(career.id, { is_active: true });
            toast.success("Carrera desarchivada correctamente");
            loadCareers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "No fue posible desarchivar la carrera");
        }
    };

    return (
        <>
            <Breadcrumb pageName="Carreras" />
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-title-md2 font-bold text-black dark:text-white">Gestión de Carreras</h2>
                        <p className="text-sm text-body">Crear, editar y archivar carreras académicas.</p>
                    </div>
                    <button
                        onClick={() => navigate("/academic/careers/create")}
                        className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                    >
                        Crear carrera
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 rounded-sm border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4 md:max-w-md">
                    <div>
                        <label className="mb-2.5 block text-black dark:text-white">Estado</label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                            <option value="">Todos</option>
                            <option value="true">Activas</option>
                            <option value="false">Archivadas</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                        <thead>
                            <tr className="text-left text-sm font-medium text-black dark:text-white">
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td className="px-4 py-5" colSpan={5}>Cargando...</td>
                                </tr>
                            )}
                            {!loading && filteredCareers.length === 0 && (
                                <tr>
                                    <td className="px-4 py-5" colSpan={5}>No hay carreras registradas.</td>
                                </tr>
                            )}
                            {!loading && filteredCareers.map((career) => (
                                <tr key={career.id} className="border-t border-stroke text-sm dark:border-strokedark">
                                    <td className="px-4 py-5 text-black dark:text-white">{career.name}</td>
                                    <td className="px-4 py-5 text-black dark:text-white">{career.code}</td>
                                    <td className="px-4 py-5 text-black dark:text-white">{career.description || "-"}</td>
                                    <td className="px-4 py-5">
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${career.is_active ? "bg-success text-white" : "bg-meta-1 text-white"}`}>
                                            {career.is_active ? "Activa" : "Archivada"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => navigate(`/academic/careers/update/${career.id}`)}
                                                className="rounded-md border border-primary px-3 py-2 text-primary hover:bg-primary hover:text-white"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    career.is_active
                                                        ? handleArchive(career)
                                                        : handleUnarchive(career)
                                                }
                                                className={`rounded-md border px-3 py-2 hover:text-white ${
                                                    career.is_active
                                                        ? "border-meta-1 text-meta-1 hover:bg-meta-1"
                                                        : "border-meta-1 text-meta-1 hover:bg-meta-1"
                                                }`}
                                            >
                                                {career.is_active ? "Archivar" : "Desarchivar"}
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

export default CareerList;
