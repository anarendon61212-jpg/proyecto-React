import React from 'react';
import type { StudentFinalGrade } from '../../hooks/useFinalGrades';

interface StudentFinalGradeTableProps {
  students: StudentFinalGrade[];
  evaluations: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
}

const StudentFinalGradeTable: React.FC<StudentFinalGradeTableProps> = ({
  students,
  evaluations,
}) => {
  const columns = 2 + evaluations.length;

  const renderStatusBadge = (status: StudentFinalGrade['status']) => {
    if (status === 'Consolidado') {
      return (
        <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
          Consolidado
        </span>
      );
    }
    if (status === 'Completo') {
      return (
        <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-3 py-1 text-sm font-medium text-primary">
          Completo
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
        Pendiente
      </span>
    );
  };

  return (
    <div className="rounded-md border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-4 text-left font-medium text-black dark:text-white">
                Estudiante
              </th>
              {evaluations.map((evaluation) => (
                <th
                  key={evaluation.id}
                  className="px-4 py-4 text-center font-medium text-black dark:text-white"
                >
                  <div>{evaluation.name}</div>
                  <div className="text-xs text-bodydark2">{evaluation.weight}%</div>
                </th>
              ))}
              <th className="px-4 py-4 text-right font-medium text-black dark:text-white">
                Nota final semestre
              </th>
              <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={columns} className="px-4 py-8 text-center text-bodydark2">
                  No hay estudiantes en este grupo
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.enrollment_id}
                  className="border-b border-stroke hover:bg-gray-1 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-black dark:text-white">
                      {student.student_name}
                    </div>
                  </td>
                  {evaluations.map((evaluation) => {
                    const studentEvaluation = student.evaluations.find(
                      (item) => item.evaluation_id === evaluation.id,
                    );

                    return (
                      <td key={evaluation.id} className="px-4 py-4 text-center">
                        {typeof studentEvaluation?.final_score === 'number' ? (
                          <span className="font-medium text-black dark:text-white">
                            {studentEvaluation.final_score.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-bodydark2">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-right">
                    <div className="text-lg font-bold text-primary">
                      {student.final_semester_score.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {renderStatusBadge(student.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentFinalGradeTable;
