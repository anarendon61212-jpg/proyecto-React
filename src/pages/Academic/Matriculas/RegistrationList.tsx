import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { matriculaService, RegistrationApi } from '../../../services/matriculaService';

type EstudianteData = {
  id: string;
  code?: string;
  codigo?: string;
  user_code?: string;
  first_name?: string;
  last_name?: string;
  identification?: string;
};

type CarreraData = {
  id: string;
  name?: string;
  codigo_carrera?: string;
};

export default function RegistrationList() {
  const [registrations, setRegistrations] = useState<RegistrationApi[]>([]);
  const [students, setStudents] = useState<Map<string, EstudianteData>>(new Map());
  const [careers, setCareers] = useState<Map<string, CarreraData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [statusChanges, setStatusChanges] = useState<Map<string, string>>(new Map());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar registraciones
        const regsResponse = await matriculaService.getRegistrations();
        const regsList = regsResponse.data?.data || regsResponse.data || [];
        setRegistrations(Array.isArray(regsList) ? regsList : []);

        // Cargar estudiantes
        try {
          const studentsResponse = await matriculaService.searchEstudiantes('');
          const studentsList = studentsResponse.data || [];
          const studentsMap = new Map<string, EstudianteData>();
          if (Array.isArray(studentsList)) {
            studentsList.forEach((student: EstudianteData) => {
              if (student.id) {
                studentsMap.set(student.id, student);
              }
            });
          }
          setStudents(studentsMap);
        } catch (error) {
          console.error('Error cargando estudiantes:', error);
        }

        // Cargar carreras
        try {
          const careersResponse = await matriculaService.getCarreras();
          const careersList = careersResponse.data?.data || careersResponse.data || [];
          const careersMap = new Map<string, CarreraData>();
          if (Array.isArray(careersList)) {
            careersList.forEach((career: CarreraData) => {
              if (career.id) {
                careersMap.set(career.id, career);
              }
            });
          }
          setCareers(careersMap);
        } catch (error) {
          console.error('Error cargando carreras:', error);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error cargando matrículas');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStudentName = (studentId?: string) => {
    if (!studentId) return 'Sin nombre';
    const student = students.get(studentId);
    const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim();
    const studentCode = student?.code || student?.codigo || student?.user_code || student?.identification;

    if (fullName && studentCode) {
      return `${fullName} (${studentCode})`;
    }

    if (fullName) {
      return fullName;
    }

    if (studentCode) {
      return studentCode;
    }

    return studentId.substring(0, 8) + '...';
  };

  const getCareerName = (careerId?: string) => {
    if (!careerId) return 'Sin nombre';
    const career = careers.get(careerId);
    if (career?.name) {
      return career.name;
    }
    return careerId.substring(0, 8) + '...';
  };

  const handleStatusChange = (registrationId: string, newStatus: string) => {
    const newChanges = new Map(statusChanges);
    newChanges.set(registrationId, newStatus);
    setStatusChanges(newChanges);
  };

  const hasChanges = (registrationId: string, currentStatus?: string) => {
    const newStatus = statusChanges.get(registrationId);
    return newStatus && newStatus !== currentStatus;
  };

  const handleSaveStatus = async (registration: RegistrationApi) => {
    const newStatus = statusChanges.get(registration.id!);
    if (!newStatus || newStatus === registration.academic_status) {
      toast.error('No hay cambios para guardar');
      return;
    }

    const newSavingIds = new Set(savingIds);
    newSavingIds.add(registration.id!);
    setSavingIds(newSavingIds);

    try {
      await matriculaService.updateRegistration(registration.id!, {
        academic_status: newStatus,
      });

      // Actualizar localmente
      setRegistrations(
        registrations.map((reg) =>
          reg.id === registration.id
            ? { ...reg, academic_status: newStatus }
            : reg
        )
      );

      // Limpiar cambios para esta matrícula
      const newChanges = new Map(statusChanges);
      newChanges.delete(registration.id!);
      setStatusChanges(newChanges);

      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando matrícula:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      newSavingIds.delete(registration.id!);
      setSavingIds(newSavingIds);
    }
  };

  const handleCancel = (registrationId: string) => {
    const newChanges = new Map(statusChanges);
    newChanges.delete(registrationId);
    setStatusChanges(newChanges);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando matrículas...</div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No hay matrículas registradas</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <th className="px-4 py-3 text-left text-sm font-semibold">Estudiante</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Carrera</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Período</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Estado Académico</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Activo</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration, index) => (
            <tr
              key={registration.id}
              className={`border-b transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-gray-100`}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                {getStudentName(registration.student_id)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {getCareerName(registration.career_id)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {registration.admission_period}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <select
                    value={
                      statusChanges.get(registration.id!) ||
                      registration.academic_status ||
                      'activo'
                    }
                    onChange={(e) =>
                      handleStatusChange(registration.id!, e.target.value)
                    }
                    className="rounded border border-stroke bg-white px-2 py-1 text-sm focus:outline-none focus:border-primary"
                    disabled={savingIds.has(registration.id!)}
                  >
                    <option value="activo">Activo</option>
                    <option value="retirado">Retirado</option>
                    <option value="suspendido">Suspendido</option>
                  </select>

                  {hasChanges(
                    registration.id!,
                    registration.academic_status
                  ) && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveStatus(registration)}
                        disabled={savingIds.has(registration.id!)}
                        className="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        {savingIds.has(registration.id!)
                          ? 'Guardando...'
                          : 'Guardar'}
                      </button>
                      <button
                        onClick={() => handleCancel(registration.id!)}
                        disabled={savingIds.has(registration.id!)}
                        className="rounded bg-gray-400 px-2 py-1 text-xs font-semibold text-white hover:bg-gray-500 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-center">
                {registration.is_active ? (
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    Sí
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                    No
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
