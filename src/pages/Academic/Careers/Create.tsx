import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import CareerForm from "./CareerForm";
import { careerService } from "../../../services/careerService";
import { CareerFormValues, Career } from "../../../models/Career";

const CareerCreate: React.FC = () => {
    const navigate = useNavigate();
    const [existingCareers, setExistingCareers] = useState<Career[]>([]);

    useEffect(() => {
        const loadCareers = async () => {
            try {
                const careers = await careerService.getCareers();
                setExistingCareers(careers);
            } catch (error) {
                console.error("Error al cargar carreras:", error);
            }
        };
        loadCareers();
    }, []);

    const handleCreate = async (values: CareerFormValues) => {
        try {
            const created = await careerService.createCareer(values);
            if (created) {
                await Swal.fire({
                    title: "Completado",
                    text: "Carrera creada correctamente",
                    icon: "success",
                    timer: 2500,
                });
                navigate("/academic/careers/list");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al crear la carrera");
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Crear Carrera" />
            <CareerForm 
                onSubmit={handleCreate} 
                submitLabel="Guardar carrera"
                existingCareers={existingCareers}
            />
        </div>
    );
};

export default CareerCreate;
