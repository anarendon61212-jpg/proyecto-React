import React from 'react';

interface ConfirmFinalGradesModalProps {
  isOpen: boolean;
  totalStudents: number;
  semesterName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmFinalGradesModal: React.FC<ConfirmFinalGradesModalProps> = ({
  isOpen,
  totalStudents,
  semesterName,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <h2 className="mb-2 text-xl font-bold text-black dark:text-white">
          Confirmar Consolidacion Oficial
        </h2>
        <p className="mb-4 text-sm text-bodydark2">
          Esta accion cerrara oficialmente el semestre para el grupo actual.
        </p>

        <div className="mb-6 rounded border border-stroke bg-gray-1 p-4 text-sm dark:border-strokedark dark:bg-meta-4">
          <p>
            <span className="font-medium text-black dark:text-white">Semestre:</span> {semesterName}
          </p>
          <p className="mt-1">
            <span className="font-medium text-black dark:text-white">Estudiantes incluidos:</span> {totalStudents}
          </p>
        </div>

        <div className="mb-4 rounded border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <p className="font-medium">Atencion</p>
          <p className="mt-1">
            Despues de consolidar, las notas quedaran bloqueadas para edicion y solo podran
            modificarse por administracion.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming || isLoading}
            className="flex-1 rounded border border-stroke px-4 py-2 font-medium text-bodydark1 hover:bg-gray-1 disabled:opacity-50 dark:border-strokedark dark:text-bodydark dark:hover:bg-meta-4"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || isLoading}
            className="flex-1 rounded bg-success px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {confirming || isLoading ? 'Consolidando...' : 'Confirmar consolidacion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmFinalGradesModal;
