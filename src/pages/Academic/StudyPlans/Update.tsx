import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumb";
import { PlanEstudio } from "../../../models/PlanEstudio";
import { studyPlanService } from "../../../services/studyPlanService";
import StudyPlanForm, { StudyPlanFormValues } from "./StudyPlanForm";

type StudyPlanEditModel = PlanEstudio & {
  creditos?: number;
};

const STUDY_PLAN_CREDITS_KEY = "study-plan-credits-overrides";

const readCreditsOverrides = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(STUDY_PLAN_CREDITS_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

const saveCreditsOverride = (planId: string, credits: number) => {
  const overrides = readCreditsOverrides();
  overrides[planId] = credits;
  localStorage.setItem(STUDY_PLAN_CREDITS_KEY, JSON.stringify(overrides));
};

const StudyPlanUpdate: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState<StudyPlanEditModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudyPlan = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const plan = await studyPlanService.getStudyPlanById(id);
        if (!plan) {
          setError("Plan de estudio no encontrado");
        }
        const creditsOverrides = readCreditsOverrides();
        setStudyPlan(
          plan
            ? {
                ...plan,
                creditos: creditsOverrides[plan.id],
              }
            : null
        );
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar el plan de estudio");
        toast.error(error || "Error al cargar el plan de estudio");
      } finally {
        setLoading(false);
      }
    };

    loadStudyPlan();
  }, [id]);

  const handleUpdate = async (values: StudyPlanFormValues) => {
    try {
      if (!id) return;
      const { creditos, ...backendValues } = values;
      await studyPlanService.updateStudyPlan(id, backendValues);
      saveCreditsOverride(id, creditos);
      await Swal.fire({
        title: "Completado",
        text: "Plan de estudio actualizado correctamente",
        icon: "success",
        timer: 2500,
      });
      navigate("/academic/study-plans");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al actualizar el plan de estudio";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <Breadcrumb pageName="Editar Plan de Estudio" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Editar Plan de Estudio
          </h3>
        </div>

        <div className="p-6.5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-lg">Cargando plan de estudio...</div>
            </div>
          ) : error ? (
            <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          ) : studyPlan ? (
            <>
              <div className="mb-6 rounded border border-dashed border-stroke p-4 dark:border-strokedark">
                <p className="text-sm text-black dark:text-white">
                  <strong>Carrera:</strong> {studyPlan.carrera?.nombre || studyPlan.carrera_id}
                </p>
                <p className="text-sm text-black dark:text-white">
                  <strong>Asignatura:</strong> {studyPlan.name}
                </p>
                <p className="text-sm text-black dark:text-white">
                  <strong>Versión:</strong> {studyPlan.year}
                </p>
                <p className="text-sm text-black dark:text-white">
                  <strong>Semestre sugerido:</strong> {studyPlan.suggested_semester}
                </p>
                <p className="text-sm text-black dark:text-white">
                  <strong>Estado:</strong> {studyPlan.is_published ? "Activo" : "Inactivo"}
                </p>
                <p className="text-sm text-black dark:text-white">
                  <strong>Créditos locales:</strong> {studyPlan.creditos ?? "Sin créditos"}
                </p>
              </div>
              <StudyPlanForm
                studyPlan={studyPlan}
                onSubmit={handleUpdate}
                submitLabel="Actualizar plan de estudio"
              />
            </>
          ) : (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">No se encontró el plan de estudio.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanUpdate;
