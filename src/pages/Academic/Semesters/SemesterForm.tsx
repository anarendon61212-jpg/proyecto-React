import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Semester, SemesterFormValues } from "../../../models/Semester";

interface SemesterFormProps {
    semester?: Semester | null;
    onSubmit: (values: SemesterFormValues) => void;
    hasActiveSemester: boolean;
    submitLabel: string;
}

const SemesterForm: React.FC<SemesterFormProps> = ({
    semester,
    onSubmit,
    hasActiveSemester,
    submitLabel,
}) => {
    const initialValues: SemesterFormValues = {
        name: semester?.name || "",
        code: semester?.code || "",
        start_date: semester?.start_date ? semester.start_date.slice(0, 10) : "",
        end_date: semester?.end_date ? semester.end_date.slice(0, 10) : "",
        is_active: semester?.is_active ?? true,
    };

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={Yup.object({
                name: Yup.string().required("El nombre es obligatorio"),
                code: Yup.string().required("El código es obligatorio"),
                start_date: Yup.string().required("La fecha de inicio es obligatoria"),
                end_date: Yup.string()
                    .required("La fecha de fin es obligatoria")
                    .test(
                        "fecha-fin-mayor",
                        "La fecha de fin debe ser posterior a la fecha de inicio",
                        function (value) {
                            const { start_date } = this.parent as SemesterFormValues;
                            if (!start_date || !value) return true;
                            return new Date(start_date) < new Date(value);
                        }
                    ),
            })}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ handleSubmit, values, setFieldValue }) => {
                const disableSubmit = hasActiveSemester && values.is_active;

                return (
                <Form
                    onSubmit={handleSubmit}
                    className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
                >
                    {disableSubmit && (
                        <div className="mb-6 rounded-md border border-meta-1 bg-meta-1/10 px-4 py-3 text-sm text-meta-1">
                            Ya existe un semestre activo global. Para guardar otro semestre activo, primero debes cerrar el actual.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="mb-2.5 block text-black dark:text-white">
                                Nombre <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="name"
                                placeholder="Semestre 2026-1"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-500" />
                        </div>

                        <div>
                            <label htmlFor="code" className="mb-2.5 block text-black dark:text-white">
                                Código <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="code"
                                placeholder="SEM-2026-1"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage name="code" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="start_date" className="mb-2.5 block text-black dark:text-white">
                                Fecha de inicio <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="date"
                                name="start_date"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage name="start_date" component="p" className="mt-1 text-sm text-red-500" />
                        </div>

                        <div>
                            <label htmlFor="end_date" className="mb-2.5 block text-black dark:text-white">
                                Fecha de fin <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="date"
                                name="end_date"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage name="end_date" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="is_active" className="mb-2.5 block text-black dark:text-white">
                            Estado
                        </label>
                        <Field
                            as="select"
                            name="is_active"
                            value={String(values.is_active)}
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                setFieldValue("is_active", event.target.value === "true");
                            }}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                            <option value="true">Activo</option>
                            <option value="false">Cerrado</option>
                        </Field>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            disabled={disableSubmit}
                            className={`inline-flex items-center justify-center rounded-md px-6 py-3 text-center font-medium text-white ${disableSubmit ? "cursor-not-allowed bg-gray-400" : "bg-primary hover:bg-opacity-90"}`}
                        >
                            {submitLabel}
                        </button>
                    </div>
                </Form>
                );
            }}
        </Formik>
    );
};

export default SemesterForm;
