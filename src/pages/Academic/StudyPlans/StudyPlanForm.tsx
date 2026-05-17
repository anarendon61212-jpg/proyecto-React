import React from "react";
import { PlanEstudio } from "../../../models/PlanEstudio";

export type StudyPlanFormValues = {
  name: string;
  suggested_semester: number;
  year: number;
  is_published: boolean;
  creditos: number;
};

type StudyPlanFormModel = PlanEstudio & {
  creditos?: number;
};

interface StudyPlanFormProps {
  studyPlan?: StudyPlanFormModel | null;
  onSubmit: (values: StudyPlanFormValues) => void;
  submitLabel: string;
}

const StudyPlanForm: React.FC<StudyPlanFormProps> = ({ studyPlan, onSubmit, submitLabel }) => {
  const [formData, setFormData] = React.useState<StudyPlanFormValues>({
    name: studyPlan?.name || "",
    suggested_semester: studyPlan?.suggested_semester || 1,
    year: studyPlan?.year || new Date().getFullYear(),
    is_published: studyPlan?.is_published ?? true,
    creditos: studyPlan?.creditos || 1,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (studyPlan) {
      setFormData({
        name: studyPlan.name || "",
        suggested_semester: studyPlan.suggested_semester || 1,
        year: studyPlan.year || new Date().getFullYear(),
        is_published: studyPlan.is_published ?? true,
        creditos: studyPlan.creditos || 1,
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
            name="name"
            value={formData.name}
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
            name="suggested_semester"
            value={formData.suggested_semester}
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
            name="year"
            value={formData.year}
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

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-stroke text-primary focus:ring-0"
            disabled={loading}
          />
          <label htmlFor="is_published" className="text-sm text-black dark:text-white">
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
