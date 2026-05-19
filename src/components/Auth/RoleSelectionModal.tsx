import React from "react";

interface RoleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoleSelect: (role: 'TEACHER' | 'STUDENT') => void;
    userName: string;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
    isOpen,
    onClose,
    onRoleSelect,
    userName,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-md">
                <h2 className="text-title-md2 font-bold text-black dark:text-white mb-4 text-center">
                    Selecciona tu rol
                </h2>
                <p className="text-sm text-body mb-6 text-center">
                    Bienvenido, <span className="font-medium">{userName}</span>. 
                    Por favor selecciona si eres docente o estudiante para continuar con el registro.
                </p>
                
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => onRoleSelect('TEACHER')}
                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 flex items-center justify-center gap-3"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <span className="font-medium">Soy Docente</span>
                    </button>

                    <button
                        onClick={() => onRoleSelect('STUDENT')}
                        className="w-full cursor-pointer rounded-lg border border-meta-3 bg-meta-3 p-4 text-white transition hover:bg-opacity-90 flex items-center justify-center gap-3"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                            />
                        </svg>
                        <span className="font-medium">Soy Estudiante</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full cursor-pointer rounded-lg border border-stroke bg-transparent p-4 text-black dark:text-white transition hover:bg-gray-100 dark:hover:bg-meta-4"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
