import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Career, CareerFormValues } from "../../../models/Career";

interface CareerFormProps {
    career?: Career | null;
    existingCareers?: Career[];
    onSubmit: (values: CareerFormValues) => void;
    submitLabel: string;
}

const CareerForm: React.FC<CareerFormProps> = ({ career, existingCareers = [], onSubmit, submitLabel }) => {
    const initialValues: CareerFormValues = {
        name: career?.name || "",
        code: career?.code || "",
        description: career?.description || "",
        is_active: career?.is_active ?? true,
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("El nombre es obligatorio"),
        code: Yup.string()
            .required("El código es obligatorio")
            .test(
                "unique-code",
                "Ya existe una carrera con este código",
                (value) => {
                    if (!value) return true;
                    const isEditing = !!career;
                    const codeExists = existingCareers.some(
                        (c) => c.code.toLowerCase() === value.toLowerCase() && c.id !== career?.id
                    );
                    return !codeExists || isEditing;
                }
            ),
        description: Yup.string().nullable(),
    });

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ handleSubmit }) => (
                <Form
                    onSubmit={handleSubmit}
                    className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
                >
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="name" className="mb-2.5 block text-black dark:text-white">
                                Nombre <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="name"
                                placeholder="Ingeniería de Sistemas"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                                placeholder="CAR-001"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage name="code" component="p" className="mt-1 text-sm text-red-500" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="mb-2.5 block text-black dark:text-white">
                            Descripción
                        </label>
                        <Field
                            as="textarea"
                            name="description"
                            rows={4}
                            placeholder="Describe la carrera"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default CareerForm;
