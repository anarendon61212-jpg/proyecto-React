import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { grupoService } from '../../services/grupoService';
import { asignaturaService } from '../../services/asignaturaService';
import { semesterService } from '../../services/semesterService';
import { finalGradeService } from '../../services/finalGradeService';
import Loader from '../../common/Loader';

interface Group {
  id: string;
  nombre: string;
  codigo_grupo: string;
  asignatura_id?: string;
  subject_id?: string;
  semestre_id?: string;
  semester_id?: string;
  docente_id?: string;
}

type GroupView = {
  id: string;
  nombre: string;
  codigo_grupo: string;
  subjectName: string;
  semesterName: string;
  status: 'Pendiente' | 'Consolidado';
};

const FinalGradesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const [groupsResponse, subjects, semesters, overview] = await Promise.all([
        grupoService.getGrupos(),
        asignaturaService.getAsignaturas(),
        semesterService.getSemesters(),
        finalGradeService.getFinalizationOverview(),
      ]);

      const groupsData = groupsResponse?.data?.data || groupsResponse?.data || [];
      if (!Array.isArray(groupsData)) {
        setGroups([]);
        return;
      }

      const subjectById = new Map<string, any>((subjects || []).map((subject: any) => [subject.id, subject]));
      const semesterById = new Map<string, any>((semesters || []).map((semester: any) => [semester.id, semester]));
      const statusByGroup = new Map<string, any>((overview || []).map((item) => [item.group_id, item]));

      const normalized: GroupView[] = (groupsData as Group[]).map((group) => {
        const subjectId = group.asignatura_id || group.subject_id;
        const semesterId = group.semestre_id || group.semester_id;
        const subject = subjectId ? subjectById.get(subjectId) : null;
        const semester = semesterId ? semesterById.get(semesterId) : null;
        const status = statusByGroup.get(group.id);

        return {
          id: group.id,
          nombre: group.nombre,
          codigo_grupo: group.codigo_grupo,
          subjectName: subject?.nombre || subject?.name || 'Sin asignatura',
          semesterName: semester?.name || semester?.code || 'Sin semestre',
          status: status?.finalized ? 'Consolidado' : 'Pendiente',
        };
      });

      setGroups(normalized);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Error al cargar los grupos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.codigo_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Registrar Notas Finales
          </h1>
          <p className="mt-1 text-sm text-bodydark2">
            Selecciona un grupo para registrar las notas finales de los estudiantes.
          </p>
        </div>
        <button
          type="button"
          onClick={loadGroups}
          className="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
        >
          Refrescar
        </button>
      </div>

      {/* Search */}
      <div className="rounded border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <input
          type="text"
          placeholder="Buscar por nombre o código del grupo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded border border-danger/30 bg-danger/10 p-4 text-danger">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadGroups}
            className="mt-3 rounded bg-danger px-4 py-2 text-sm text-white hover:bg-opacity-90"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full rounded border border-dashed border-bodydark2 bg-white p-12 text-center dark:border-bodydark dark:bg-boxdark">
            <svg
              className="mx-auto h-12 w-12 text-bodydark2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m0 0h6"
              />
            </svg>
            <p className="mt-4 text-bodydark2">
              {groups.length === 0
                        ? 'No hay grupos disponibles para notas finales'
                : 'No se encontraron grupos que coincidan con tu búsqueda'}
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => navigate(`/final-grades/${group.id}`)}
              className="block rounded border border-stroke p-4 text-left transition hover:shadow-md dark:border-strokedark dark:bg-boxdark"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-black dark:text-white">
                    {group.nombre}
                  </h3>
                  <p className="text-sm text-bodydark2">
                    Código: {group.codigo_grupo}
                  </p>
                          <p className="text-sm text-bodydark2">Asignatura: {group.subjectName}</p>
                          <p className="text-sm text-bodydark2">Semestre: {group.semesterName}</p>
                </div>
                        <div className="flex items-center justify-between pt-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                              group.status === 'Consolidado'
                                ? 'bg-success bg-opacity-10 text-success'
                                : 'bg-warning bg-opacity-10 text-warning'
                            }`}
                          >
                            {group.status}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded bg-primary bg-opacity-10 px-3 py-1 text-sm font-medium text-primary">
                            Ver consolidado
                          </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default FinalGradesPage;
