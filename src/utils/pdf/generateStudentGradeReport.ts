import type { StudentGradeDetail } from '../../hooks/useStudentGrades';

export const generateStudentGradeReport = (
  gradeDetail: StudentGradeDetail,
  studentName: string,
) => {
  const printWindow = window.open('', '', 'height=800,width=1000');

  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana para generar el PDF');
  }

  const criteriaRows = gradeDetail.criteria_details
    .map(
      (detail) => `
    <tr>
      <td>${detail.criterion_name}</td>
      <td>${detail.criterion_weight}%</td>
      <td>${detail.scale_name}</td>
      <td>${detail.scale_value}</td>
      <td>${detail.score.toFixed(2)}</td>
      <td>${detail.comment || '-'}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reporte de Calificación - ${gradeDetail.evaluation_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #111827; padding-bottom: 16px; }
          .header h1 { margin: 0 0 8px; font-size: 24px; color: #111827; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; background: #f9fafb; padding: 16px; border-radius: 8px; }
          .student-info p { margin: 0; font-size: 13px; }
          .student-info strong { color: #111827; }
          .final-score { display: flex; justify-content: space-between; align-items: center; background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
          .final-score .score { font-size: 36px; font-weight: bold; }
          .observations { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px; }
          .observations p { margin: 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          thead { background-color: #111827; color: #ffffff; }
          th, td { border: 1px solid #d1d5db; padding: 12px 8px; vertical-align: top; font-size: 12px; text-align: left; }
          th { font-weight: 600; }
          td:nth-child(4), td:nth-child(5) { text-align: center; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 20px; font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE CALIFICACIÓN DETALLADA</h1>
          <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Sistema de Gestión Académica</p>
        </div>

        <div class="student-info">
          <p><strong>Estudiante:</strong> ${studentName}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          <p><strong>Evaluación:</strong> ${gradeDetail.evaluation_name}</p>
          <p><strong>Asignatura:</strong> ${gradeDetail.subject_name}</p>
          <p><strong>Grupo:</strong> ${gradeDetail.group_name}</p>
          <p><strong>Estado:</strong> ${gradeDetail.status === 'SENT' ? 'Oficial' : 'Borrador'}</p>
        </div>

        <div class="final-score">
          <div>
            <p style="margin: 0; font-size: 14px;">NOTA FINAL</p>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Calificación oficial</p>
          </div>
          <div class="score">
            ${gradeDetail.final_score !== null ? gradeDetail.final_score.toFixed(2) : '-'}
          </div>
        </div>

        ${gradeDetail.observations ? `
        <div class="observations">
          <p style="margin: 0 0 8px; font-weight: 600;">OBSERVACIONES DEL DOCENTE</p>
          <p style="margin: 0;">${gradeDetail.observations}</p>
        </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>Criterio</th>
              <th>Peso</th>
              <th>Nivel Obtenido</th>
              <th>Valor</th>
              <th>Puntaje</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            ${criteriaRows}
          </tbody>
        </table>

        ${gradeDetail.rubric ? `
        <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 13px;">RÚBRICA UTILIZADA</p>
          <p style="margin: 0; font-size: 13px;">${gradeDetail.rubric.title}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">${gradeDetail.rubric.description}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Reporte generado el ${new Date().toLocaleString('es-ES')}</p>
          <p style="margin: 4px 0 0;">Este documento es una copia oficial de la calificación registrada en el sistema.</p>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
