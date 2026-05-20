import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { docenteService } from '../../../services/docenteService';
import { grupoService } from '../../../services/grupoService';
import { semesterService } from '../../../services/semesterService';
import { asignaturaService } from '../../../services/asignaturaService';

type SubjectApi = {
  id: string;
  nombre?: string;
  name?: string;
  codigo?: string;
  code?: string;
};

type GrupoApi = {
  id: string;
  nombre?: string;
  name?: string;
  codigo_grupo?: string;
  group_code?: string;
  semestre_id?: string;
  semester_id?: string;
  asignatura_id?: string;
  subject_id?: string;
  asignatura?: SubjectApi;
  subject?: SubjectApi;
  docente_id?: string | null;
  teacher_id?: string | null;
};

type DocenteApi = {
  id: string;
  nombre?: string;
  first_name?: string;
  apellido?: string;
  last_name?: string;
  cedula?: string;
  identification?: string;
};

type SemesterApi = {
  id: string;
  nombre?: string;
  name?: string;
  codigo?: string;
  code?: string;
  estado?: boolean;
  is_active?: boolean;
};

const isSemesterActive = (semester: SemesterApi) =>
  semester.is_active === true || semester.estado === true;

const getSemesterLabel = (semester: SemesterApi) => {
  const nombre = semester.nombre || semester.name || 'Semestre sin nombre';
  const codigo = semester.codigo || semester.code || 'Sin código';
  return `${nombre} (${codigo})`;
};

const getSubjectName = (subject?: SubjectApi | null) =>
  (subject?.nombre || subject?.name || 'Asignatura sin nombre').trim();

const getSubjectCode = (subject?: SubjectApi | null) =>
  (subject?.codigo || subject?.code || 'Sin código').trim();

const getSubjectLabel = (subject?: SubjectApi | null) =>
  `${getSubjectName(subject)} (${getSubjectCode(subject)})`;

const getGroupSubject = (grupo: GrupoApi, subjectsById: Map<string, SubjectApi>) => {
  const subjectId =
    grupo.asignatura_id ||
    grupo.subject_id ||
    grupo.asignatura?.id ||
    grupo.subject?.id ||
    '';

  return (
    subjectsById.get(subjectId) ||
    grupo.asignatura ||
    grupo.subject ||
    null
  );
};

const getGrupoLabel = (
  grupo: GrupoApi,
  subjectsById: Map<string, SubjectApi>,
) => {
  const nombre = grupo.nombre || grupo.name || 'Grupo sin nombre';
  const codigo = grupo.codigo_grupo || grupo.group_code || 'Sin código';
  const subject = getGroupSubject(grupo, subjectsById);
  const subjectLabel = subject ? ` - ${getSubjectLabel(subject)}` : '';
  return `${nombre} (${codigo})${subjectLabel}`;
};

const getDocenteLabel = (docente: DocenteApi) => {
  const nombre = docente.nombre || docente.first_name || '';
  const apellido = docente.apellido || docente.last_name || '';
  const cedula = docente.cedula || docente.identification || 'Sin cédula';
  const fullName = `${nombre} ${apellido}`.trim() || 'Docente sin nombre';
  return `${fullName} (${cedula})`;
};

const AssignDocente = () => {
  const [grupos, setGrupos] = useState<GrupoApi[]>([]);
  const [docentes, setDocentes] = useState<DocenteApi[]>([]);
  const [semestres, setSemestres] = useState<SemesterApi[]>([]);
  const [subjects, setSubjects] = useState<SubjectApi[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDocente, setSelectedDocente] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gruposResp, docentesResp, semestresResp, asignaturasResp] = await Promise.all([
          grupoService.getGrupos(),
          docenteService.getDocentes(),
          semesterService.getSemesters(),
          asignaturaService.getAsignaturas(),
        ]);

        const fetchedSemestres: SemesterApi[] = Array.isArray(semestresResp)
          ? semestresResp
          : semestresResp.data?.data || semestresResp.data || [];
        const activeSemestres = fetchedSemestres.filter(isSemesterActive);
        const semesterOptions = activeSemestres.length > 0 ? activeSemestres : fetchedSemestres;

        setSemestres(semesterOptions);
        if (semesterOptions.length === 1) {
          setSelectedSemester(semesterOptions[0].id);
        }

        setGrupos(gruposResp.data?.data || gruposResp.data || []);
        setDocentes(docentesResp.data?.data || docentesResp.data || []);
        setSubjects(asignaturasResp || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error cargando datos');
      }
    };

    loadData();
  }, []);

  const filteredGroups = selectedSemester
    ? grupos.filter((grupo) => {
        const grupoSemesterId = grupo.semestre_id || grupo.semester_id || '';
        const hasAsignatura = Boolean(grupo.asignatura_id || grupo.subject_id || grupo.asignatura || grupo.subject);
        return grupoSemesterId === selectedSemester && hasAsignatura;
      })
    : [];

  const selectedGroup = useMemo(
    () => filteredGroups.find((grupo) => grupo.id === selectedGrupo) || null,
    [filteredGroups, selectedGrupo],
  );

  const handleAsignarDocente = async () => {
    if (!selectedSemester) {
      toast.error('Selecciona el semestre activo');
      return;
    }

    if (!selectedGrupo || !selectedDocente) {
      toast.error('Selecciona grupo y docente');
      return;
    }

    setLoading(true);
    try {
      const response = await grupoService.asignarDocente(selectedGrupo, selectedDocente);
      const successMessage = response.data?.message || 'Docente asignado correctamente';
      toast.success(successMessage);

      // Actualizar lista de grupos
      const gruposResp = await grupoService.getGrupos();
      setGrupos(gruposResp.data?.data || gruposResp.data || []);

      setSelectedGrupo('');
      setSelectedDocente('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al asignar docente';
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Asignar Docente a Grupo" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
          Asignar Docente a Grupo
        </h3>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Semestre
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedGrupo('');
              }}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
            >
              <option value="">Selecciona el semestre activo...</option>
              {semestres.map((semestre) => (
                <option key={semestre.id} value={semestre.id}>
                  {getSemesterLabel(semestre)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Grupo
            </label>
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              disabled={!selectedSemester}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
            >
              <option value="">
                {selectedSemester ? 'Selecciona un grupo...' : 'Selecciona primero un semestre...'}
              </option>
              {filteredGroups.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {getGrupoLabel(grupo, subjectsById)}
                </option>
              ))}
            </select>
            {selectedGroup ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Asignatura asociada: {getSubjectLabel(getGroupSubject(selectedGroup, subjectsById))}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Docente
            </label>
            <select
              value={selectedDocente}
              onChange={(e) => setSelectedDocente(e.target.value)}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
            >
              <option value="">Selecciona un docente...</option>
              {docentes.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {getDocenteLabel(docente)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAsignarDocente}
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Asignando...' : 'Asignar Docente'}
          </button>
        </div>

      </div>
    </>
  );
};

export default AssignDocente;
