import React from 'react';
import type { FinalGradesState } from '../../hooks/useFinalGrades';

interface FinalGradeSummaryProps {
  finalGradesState: FinalGradesState | null;
  pendingCount: number;
  completeCount: number;
  consolidatedCount: number;
}

const FinalGradeSummary: React.FC<FinalGradeSummaryProps> = ({
  finalGradesState,
  pendingCount,
  completeCount,
  consolidatedCount,
}) => {
  if (!finalGradesState) return null;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-md border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-bodydark2">Total Estudiantes</h3>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {finalGradesState.students.length}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
            <svg
              className="h-6 w-6 fill-primary"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 7.5C10.6569 7.5 12 6.15685 12 4.5C12 2.84315 10.6569 1.5 9 1.5C7.34315 1.5 6 2.84315 6 4.5C6 6.15685 7.34315 7.5 9 7.5Z" />
              <path d="M9 9C5.68629 9 3 11.6863 3 15V16.5H15V15C15 11.6863 12.3137 9 9 9Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-bodydark2">Pendientes</h3>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {pendingCount}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning bg-opacity-10">
            <svg
              className="h-6 w-6 fill-warning"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 1.5C5.0294 1.5 1.86 4.668 1.86 8.6385C1.86 12.609 5.0294 15.7785 9 15.7785C12.9706 15.7785 16.14 12.609 16.14 8.6385C16.14 4.668 12.9706 1.5 9 1.5ZM9.75 12H8.25V10.5H9.75V12ZM9.75 9.75H8.25V5.25H9.75V9.75Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-bodydark2">Completos</h3>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {completeCount}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary bg-opacity-10">
            <svg
              className="h-6 w-6 fill-primary"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16.2002 2.20002L6.8002 11.4L2.0002 6.8C1.5002 6.3 0.700195 6.3 0.200195 6.8C-0.299805 7.3 -0.299805 8.1 0.200195 8.6L5.5002 14C6.0002 14.5 6.8002 14.5 7.3002 14L17.7002 3.6C18.2002 3.1 18.2002 2.3 17.7002 1.8C17.2002 1.3 16.4002 1.3 15.9002 1.8L16.2002 2.20002Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-bodydark2">Consolidados</h3>
            <p className="mt-2 text-3xl font-bold text-black dark:text-white">
              {consolidatedCount}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success bg-opacity-10">
            <svg
              className="h-6 w-6 fill-success"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16.2002 2.20002L6.8002 11.4L2.0002 6.8C1.5002 6.3 0.700195 6.3 0.200195 6.8C-0.299805 7.3 -0.299805 8.1 0.200195 8.6L5.5002 14C6.0002 14.5 6.8002 14.5 7.3002 14L17.7002 3.6C18.2002 3.1 18.2002 2.3 17.7002 1.8C17.2002 1.3 16.4002 1.3 15.9002 1.8L16.2002 2.20002Z" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-bodydark2">
          Promedio del grupo: {finalGradesState.averageFinalGrade.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default FinalGradeSummary;
