import React from 'react';
import toast from 'react-hot-toast';
import type { FinalGradesState } from '../../hooks/useFinalGrades';
import { finalGradeService } from '../../services/finalGradeService';

interface DownloadPdfButtonProps {
  finalGradesState: FinalGradesState | null;
  disabled?: boolean;
}

const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  finalGradesState,
  disabled = false,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateReport = async () => {
    if (!finalGradesState) return;

    setIsGenerating(true);
    try {
      const blob = await finalGradeService.downloadOfficialReport(finalGradesState.groupId);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const fileName = `reporte-final-${finalGradesState.groupId}.pdf`;
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'No se pudo descargar el PDF oficial.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateReport}
      disabled={disabled || isGenerating || !finalGradesState}
      className="inline-flex items-center gap-2 rounded bg-warning px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
      </svg>
      {isGenerating ? 'Generando...' : 'Descargar PDF oficial'}
    </button>
  );
};

export default DownloadPdfButton;
