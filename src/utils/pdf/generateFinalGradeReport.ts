import type { FinalGradesState } from '../../hooks/useFinalGrades';

export const generateFinalGradeReport = (finalGradesState: FinalGradesState) => {
  const printWindow = window.open('', '', 'height=800,width=1000');

  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana para generar el PDF');
  }

  const evaluationRows = finalGradesState.students
    .map(
      (student) => `
    <tr>
      <td>${student.student_name}</td>
      <td>${student.evaluations
        .map((e) => `${e.name} (${e.weight}%): ${typeof e.final_score === 'number' ? e.final_score.toFixed(2) : '-'}`)
        .join('<br/>')}</td>
      <td style="text-align: right; font-weight: bold;">${student.final_semester_score.toFixed(2)}</td>
      <td style="text-align: center;">${student.status}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Notas Finales - ${finalGradesState.groupName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { margin: 0 0 8px; font-size: 24px; color: #111827; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
          .meta p { margin: 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          thead { background-color: #111827; color: #ffffff; }
          th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; font-size: 12px; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 20px; font-size: 11px; color: #6b7280; text-align: center; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE NOTAS FINALES</h1>
        </div>

        <div class="meta">
          <p><strong>Grupo:</strong> ${finalGradesState.groupName}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          <p><strong>Total estudiantes:</strong> ${finalGradesState.students.length}</p>
          <p><strong>Promedio final:</strong> ${finalGradesState.averageFinalGrade.toFixed(2)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Evaluaciones</th>
              <th>Nota final</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${evaluationRows}
          </tbody>
        </table>

        <div class="footer">
          Reporte generado el ${new Date().toLocaleString('es-ES')}
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
