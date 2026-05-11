import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { docenteService } from '../../../services/docenteService';
import { grupoService } from '../../../services/grupoService';

type GrupoApi = {
  id: string;
  nombre?: string;
  name?: string;
  codigo_grupo?: string;
  group_code?: string;
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

const getGrupoLabel = (grupo: GrupoApi) => {
  const nombre = grupo.nombre || grupo.name || 'Grupo sin nombre';
  const codigo = grupo.codigo_grupo || grupo.group_code || 'Sin código';
  return `${nombre} (${codigo})`;
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
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDocente, setSelectedDocente] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gruposResp, docentesResp] = await Promise.all([
          grupoService.getGrupos(),
          docenteService.getDocentes()
        ]);

        setGrupos(gruposResp.data?.data || gruposResp.data || []);
        setDocentes(docentesResp.data?.data || docentesResp.data || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error cargando datos');
      }
    };

    loadData();
  }, []);

  const handleAsignarDocente = async () => {
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
              Grupo
            </label>
            <select
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
            >
              <option value="">Selecciona un grupo...</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {getGrupoLabel(grupo)}
                </option>
              ))}
            </select>
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
