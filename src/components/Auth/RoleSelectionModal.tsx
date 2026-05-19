import React from "react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onRoleSelect?: (role: 'TEACHER' | 'STUDENT') => void;
  onSelectRole?: (role: 'STUDENT' | 'TEACHER') => Promise<void>;
  userName?: string;
  isLoading?: boolean;
  adminExists?: boolean;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
  onSelectRole,
  userName,
  isLoading = false,
  adminExists = false,
}) => {
  const [selecting, setSelecting] = React.useState(false);

  const handleSelectRole = async (role: 'STUDENT' | 'TEACHER') => {
    setSelecting(true);
    try {
      if (onSelectRole) {
        await onSelectRole(role);
      } else if (onRoleSelect) {
        onRoleSelect(role);
      }
    } finally {
      setSelecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark">
        <h2 className="mb-2 text-2xl font-bold text-black dark:text-white text-center">
          Selecciona tu Rol
        </h2>
        <p className="mb-6 text-sm text-bodydark2 text-center">
          {userName ? (
            <>Bienvenido, <span className="font-medium">{userName}</span>. </>
          ) : null}
          Por favor, selecciona el rol que mejor describe tu función en la plataforma.
          Esta selección solo se realiza una vez en tu primer acceso.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSelectRole('STUDENT')}
            disabled={selecting || isLoading}
            className="w-full rounded-lg border-2 border-primary bg-white px-6 py-4 font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50 dark:bg-boxdark dark:text-primary"
          >
            {selecting || isLoading ? 'Procesando...' : 'Soy Estudiante'}
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('TEACHER')}
            disabled={selecting || isLoading || adminExists}
            title={adminExists ? 'Ya existe un docente en el sistema' : undefined}
            className="w-full rounded-lg border-2 border-success bg-white px-6 py-4 font-medium text-success transition hover:bg-success hover:text-white disabled:opacity-50 dark:bg-boxdark dark:text-success"
          >
            {selecting || isLoading ? 'Procesando...' : 'Soy Docente'}
          </button>
        </div>

        {adminExists && (
          <div className="mt-4 rounded border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <p className="font-medium">Nota</p>
            <p className="mt-1">
              Ya existe un docente asignado en el sistema. Si necesitas ese rol, contacta al administrador.
            </p>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full cursor-pointer rounded-lg border border-stroke bg-transparent p-4 text-black dark:text-white transition hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            Cancelar
          </button>
        )}

        <p className="mt-6 text-xs text-bodydark2 text-center">
          No puedes cambiar tu rol después de seleccionarlo. Si tienes dudas, contacta al administrador.
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
