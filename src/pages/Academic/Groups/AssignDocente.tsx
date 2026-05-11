import { useState, useEffect } from 'react';
import { grupoService } from '../../services/grupoService';
import { docenteService } from '../../services/docenteService';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';

const AssignDocente = () => {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
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

      toast.success('Docente asignado correctamente');

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
    <DefaultLayout>
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
              {grupos.map((grupo: any) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.name} ({grupo.group_code})
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
              {docentes.map((docente: any) => (
                <option key={docente.id} value={docente.id}>
                  {docente.first_name} {docente.last_name} ({docente.identification})
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

        {/* Tabla de grupos y docentes */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
            Grupos y Docentes Asignados
          </h3>
          <div className="overflow-x-auto rounded-sm border border-stroke dark:border-strokedark">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Grupo
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Código
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Docente
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo: any) => {
                  const docente = docentes.find((d: any) => d.id === grupo.teacher_id);
                  return (
                    <tr key={grupo.id} className="border-b border-stroke dark:border-strokedark">
                      <td className="px-4 py-5">{grupo.name}</td>
                      <td className="px-4 py-5">{grupo.group_code}</td>
                      <td className="px-4 py-5">
                        {docente
                          ? `${docente.first_name} ${docente.last_name}`
                          : '-'}
                      </td>
                      <td className="px-4 py-5">
                        {docente ? (
                          <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                            Asignado
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
                            Sin asignar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AssignDocente;
