import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { User } from "../../models/User";

interface MyFormProps {
    mode: number; // 1 (crear) o 2 (actualizar)
    handleAction: (values: User) => void;
    user?: User | null;
}

const UserFormValidator: React.FC<MyFormProps> = ({ mode, handleAction, user }) => {
    const initialValues: any = user
        ? {
            id: user.id || "",
            email: user.email || "",
            code: user.code || "",
            role: user.role || "STUDENT",
            is_active: user.is_active !== undefined ? user.is_active : true,
            profile: {
                first_name: user.profile?.first_name || "",
                last_name: user.profile?.last_name || "",
                identification: user.profile?.identification || "",
                phone: user.profile?.phone || "",
                specialty: user.profile?.specialty || "",
            },
        }
        : {
            id: "",
            email: "",
            code: "",
            role: "STUDENT",
            is_active: true,
            password: "", // Solo para crear
            profile: {
                first_name: "",
                last_name: "",
                identification: "",
                phone: "",
                specialty: "",
            },
        };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={Yup.object({
                email: Yup.string()
                    .email("Email inválido")
                    .required("El email es obligatorio"),
                code: Yup.string()
                    .required("El código es obligatorio"),
                role: Yup.string()
                    .required("El rol es obligatorio"),
                password: mode === 1 
                    ? Yup.string().required("La contraseña es obligatoria")
                    : Yup.string().optional(),
            })}
            onSubmit={(values) => {
                handleAction(values as User);
            }}
        >
            {({ handleSubmit, values }) => (
                <Form
                    onSubmit={handleSubmit}
                    className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
                >
                    {/* Email y Code */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Email <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="email"
                                name="email"
                                placeholder="usuario@example.com"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage
                                name="email"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="code"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Código <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="code"
                                placeholder="P001"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage
                                name="code"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                    </div>

                    {/* Role y Estado */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label
                                htmlFor="role"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Rol <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                as="select"
                                name="role"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value="">Seleccionar rol</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="TEACHER">Docente</option>
                                <option value="STUDENT">Estudiante</option>
                            </Field>
                            <ErrorMessage
                                name="role"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="is_active"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Estado
                            </label>
                            <Field
                                as="select"
                                name="is_active"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                                <option value={true}>Activo</option>
                                <option value={false}>Inactivo</option>
                            </Field>
                        </div>
                    </div>

                    {/* Contraseña (solo crear) */}
                    {mode === 1 && (
                        <div className="mb-6">
                            <label
                                htmlFor="password"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Contraseña <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage
                                name="password"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                    )}

                    {/* Nombres */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label
                                htmlFor="profile.first_name"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Nombre <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="profile.first_name"
                                placeholder="Juan"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage
                                name="profile.first_name"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile.last_name"
                                className="mb-2.5 block text-black dark:text-white"
                            >
                                Apellido <span className="text-meta-1">*</span>
                            </label>
                            <Field
                                type="text"
                                name="profile.last_name"
                                placeholder="Pérez"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <ErrorMessage
                                name="profile.last_name"
                                component="p"
                                className="text-red-500 text-sm mt-1"
                            />
                        </div>
                    </div>

                    {/* Identificación */}
                    <div className="mb-6">
                        <label
                            htmlFor="profile.identification"
                            className="mb-2.5 block text-black dark:text-white"
                        >
                            Identificación <span className="text-meta-1">*</span>
                        </label>
                        <Field
                            type="text"
                            name="profile.identification"
                            placeholder="1234567890"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <ErrorMessage
                            name="profile.identification"
                            component="p"
                            className="text-red-500 text-sm mt-1"
                        />
                    </div>

                    {/* Campos condicionales para TEACHER */}
                    {values.role === "TEACHER" && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label
                                        htmlFor="profile.phone"
                                        className="mb-2.5 block text-black dark:text-white"
                                    >
                                        Teléfono <span className="text-meta-1">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        name="profile.phone"
                                        placeholder="3001234567"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    <ErrorMessage
                                        name="profile.phone"
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="profile.specialty"
                                        className="mb-2.5 block text-black dark:text-white"
                                    >
                                        Especialidad <span className="text-meta-1">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        name="profile.specialty"
                                        placeholder="Matemáticas"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                    <ErrorMessage
                                        name="profile.specialty"
                                        component="p"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botón de envío */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                        >
                            {mode === 1 ? "Crear Usuario" : "Actualizar Usuario"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default UserFormValidator;