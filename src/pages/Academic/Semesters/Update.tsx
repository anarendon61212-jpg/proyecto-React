import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { Semester, SemesterFormValues } from "../../../models/Semester";
import { semesterService } from "../../../services/semesterService";
import SemesterForm from "./SemesterForm";

const SemesterUpdate: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [semester, setSemester] = useState<Semester | null>(null);
    const [hasActiveSemester, setHasActiveSemester] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const semesterData = id ? await semesterService.getSemesterById(id) : null;

            setSemester(semesterData);
        };

        loadData();
    }, [id]);

    useEffect(() => {
        const checkActiveSemester = async () => {
            const activeSemesters = await semesterService.getActiveSemesters();
            setHasActiveSemester(activeSemesters.some((currentSemester) => currentSemester.id !== id));
        };

        checkActiveSemester();
    }, [id, semester]);

    const handleUpdate = async (values: SemesterFormValues) => {
        try {
            if (!id) return;

            if (hasActiveSemester && values.is_active) {
                toast.error("Ya existe un semestre activo global");
                return;
            }

            const updated = await semesterService.updateSemester(id, values);
            if (updated) {
                await Swal.fire({
                    title: "Completado",
                    text: "Semestre actualizado correctamente",
                    icon: "success",
                    timer: 2500,
                });
                navigate("/academic/semesters/list");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al actualizar el semestre");
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Editar Semestre" />
            <SemesterForm
                semester={semester}
                onSubmit={handleUpdate}
                hasActiveSemester={hasActiveSemester}
                submitLabel="Actualizar semestre"
            />
        </div>
    );
};

export default SemesterUpdate;
