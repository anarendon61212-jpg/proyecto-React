import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { SemesterFormValues } from "../../../models/Semester";
import { semesterService } from "../../../services/semesterService";
import SemesterForm from "./SemesterForm";

const SemesterCreate: React.FC = () => {
    const navigate = useNavigate();
    const [hasActiveSemester, setHasActiveSemester] = useState(false);

    useEffect(() => {
        const checkActiveSemester = async () => {
            const activeSemesters = await semesterService.getActiveSemesters();
            setHasActiveSemester(activeSemesters.length > 0);
        };

        checkActiveSemester();
    }, []);

    const handleCreate = async (values: SemesterFormValues) => {
        try {
            if (hasActiveSemester && values.is_active) {
                toast.error("Ya existe un semestre activo global");
                return;
            }

            const created = await semesterService.createSemester(values);
            if (created) {
                await Swal.fire({
                    title: "Completado",
                    text: "Semestre creado correctamente",
                    icon: "success",
                    timer: 2500,
                });
                navigate("/academic/semesters/list");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al crear el semestre");
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Crear Semestre" />
            <SemesterForm
                onSubmit={handleCreate}
                hasActiveSemester={hasActiveSemester}
                submitLabel="Guardar semestre"
            />
        </div>
    );
};

export default SemesterCreate;
