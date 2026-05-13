import React from "react";
import { PlanEstudio } from "../../../models/PlanEstudio";

export type StudyPlanFormValues = {
  nombre: string;
  semestre_sugerido: number;
  creditos: number;
  version: number;
  activo: boolean;
};

interface StudyPlanFormProps {
  studyPlan?: PlanEstudio | null;
  onSubmit: (values: StudyPlanFormValues) => void;
  submitLabel: string;
}

const StudyPlanForm: React.FC<StudyPlanFormProps> = ({ studyPlan, onSubmit, submitLabel }) => {
  const [formData, setFormData] = React.useState<StudyPlanFormValues>({
    nombre: studyPlan?.nombre || "",
    semestre_sugerido: studyPlan?.semestre_sugerido || 1,
    creditos: studyPlan?.creditos || 1,
    version: studyPlan?.version || 1,
    activo: studyPlan?.activo ?? true,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (studyPlan) {
      setFormData({
        nombre: studyPlan.nombre || "",
        semestre_sugerido: studyPlan.semestre_sugerido || 1,
        creditos: studyPlan.creditos || 1,
        version: studyPlan.version || 1,
        activo: studyPlan.activo ?? true,
      });
    }
  }, [studyPlan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Nombre del plan de estudios
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Semestre sugerido
          </label>
          <input
            type="number"
            min={1}
            name="semestre_sugerido"
            value={formData.semestre_sugerido}
            onChange={handleChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Créditos
          </label>
          <input
            type="number"
            min={1}
            max={10}
            name="creditos"
            value={formData.creditos}
            onChange={handleChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Versión
          </label>
          <input
            type="number"
            min={1}
            name="version"
            value={formData.version}
            onChange={handleChange}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-stroke text-primary focus:ring-0"
            disabled={loading}
          />
          <label htmlFor="activo" className="text-sm text-black dark:text-white">
            Plan de estudios activo
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default StudyPlanForm;
