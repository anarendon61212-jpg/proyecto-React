import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Breadcrumb from "../../../components/Breadcrumb";
import { Career } from "../../../models/Career";
import { careerService } from "../../../services/careerService";
import CareerForm from "./CareerForm";
import { CareerFormValues } from "../../../models/Career";

const CareerUpdate: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [career, setCareer] = useState<Career | null>(null);
    const [existingCareers, setExistingCareers] = useState<Career[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            const [careerData, careersData] = await Promise.all([
                careerService.getCareerById(id),
                careerService.getCareers(),
            ]);
            setCareer(careerData);
            setExistingCareers(careersData);
        };

        loadData();
    }, [id]);

    const handleUpdate = async (values: CareerFormValues) => {
        try {
            if (!id) return;
            const updated = await careerService.updateCareer(id, values);
            if (updated) {
                await Swal.fire({
                    title: "Completado",
                    text: "Carrera actualizada correctamente",
                    icon: "success",
                    timer: 2500,
                });
                navigate("/academic/careers/list");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al actualizar la carrera");
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Editar Carrera" />
            <CareerForm 
                career={career} 
                onSubmit={handleUpdate} 
                submitLabel="Actualizar carrera"
                existingCareers={existingCareers}
            />
        </div>
    );
};

export default CareerUpdate;
