import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { matriculaService } from '../../../services/matriculaService';

type CarreraApi = {
  id: string;
  nombre?: string;
  codigo?: string;
  name?: string;
  code?: string;
};

type EstudianteApi = {
  id: string;
  role?: string;
  is_active?: boolean;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  first_name?: string;
  last_name?: string;
  identification?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    identification?: string;
  };
};

const getCarreraLabel = (carrera: CarreraApi) => {
  const nombre = carrera.nombre || carrera.name || 'Carrera sin nombre';
  const codigo = carrera.codigo || carrera.code || 'Sin codigo';
  return `${nombre} (${codigo})`;
};

const getEstudianteLabel = (estudiante: EstudianteApi) => {
  const nombre = estudiante.nombre || estudiante.first_name || estudiante.profile?.first_name || '';
  const apellido = estudiante.apellido || estudiante.last_name || estudiante.profile?.last_name || '';
  const cedula = estudiante.cedula || estudiante.identification || estudiante.profile?.identification || 'Sin cedula';
  const fullName = `${nombre} ${apellido}`.trim() || 'Estudiante sin nombre';
  return `${fullName} (${cedula})`;
};

const MatriculaForm = () => {
  const [carreras, setCarreras] = useState<CarreraApi[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteApi[]>([]);

  const [selectedEstudianteId, setSelectedEstudianteId] = useState<string>('');
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>('');
  const [periodoIngreso, setPeriodoIngreso] = useState<string>('');
  const [estadoAcademico, setEstadoAcademico] = useState<string>('activo');
  const [estudianteSearch, setEstudianteSearch] = useState<string>('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [searchingEstudiantes, setSearchingEstudiantes] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadCarreras = async () => {
      setLoadingCarreras(true);
      try {
        const response = await matriculaService.getCarreras();
        setCarreras(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error cargando carreras:', error);
        toast.error('Error cargando carreras');
      } finally {
        setLoadingCarreras(false);
      }
    };

    loadCarreras();
  }, []);

  useEffect(() => {
    if (selectedEstudianteId) {
      return;
    }

    if (estudianteSearch.trim().length < 2) {
      setEstudiantes([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchingEstudiantes(true);
      try {
        const response = await matriculaService.searchEstudiantes(estudianteSearch.trim());
        setEstudiantes(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error buscando estudiantes:', error);
        setEstudiantes([]);
      } finally {
        setSearchingEstudiantes(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [estudianteSearch, selectedEstudianteId]);

  const canShowSuggestions = useMemo(() => {
    return showSuggestions && !selectedEstudianteId && estudianteSearch.trim().length >= 2;
  }, [showSuggestions, selectedEstudianteId, estudianteSearch]);

  const handleSelectEstudiante = (estudiante: EstudianteApi) => {
    setSelectedEstudianteId(estudiante.id);
    setEstudianteSearch(getEstudianteLabel(estudiante));
    setShowSuggestions(false);
  };

  const handleEstudianteInput = (value: string) => {
    setEstudianteSearch(value);
    if (selectedEstudianteId) {
      setSelectedEstudianteId('');
    }
    setShowSuggestions(true);
  };

  const resetForm = () => {
    setSelectedEstudianteId('');
    setSelectedCarreraId('');
    setPeriodoIngreso('');
    setEstadoAcademico('activo');
    setEstudianteSearch('');
    setEstudiantes([]);
    setShowSuggestions(false);
  };

  const handleCreateMatricula = async () => {
    if (!selectedEstudianteId || !selectedCarreraId || !periodoIngreso.trim() || !estadoAcademico) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    setSaving(true);
    try {
      const response = await matriculaService.createMatricula({
        estudiante_id: selectedEstudianteId,
        carrera_id: selectedCarreraId,
        periodo_ingreso: periodoIngreso.trim(),
        estado_academico: estadoAcademico,
      });

      const successMessage = response.data?.message || 'Matricula creada correctamente';
      toast.success(successMessage);
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear matricula';
      toast.error(errorMessage);
      console.error('Error creando matricula:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Matricular Estudiante en Carrera" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
          Matricular Estudiante en Carrera
        </h3>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Estudiante
            </label>
            <input
              type="text"
              value={estudianteSearch}
              onChange={(e) => handleEstudianteInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar estudiante por nombre o cedula"
              className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
            />

            {canShowSuggestions && (
              <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                {searchingEstudiantes && (
                  <div className="px-4 py-2 text-sm text-bodydark2">Buscando...</div>
                )}

                {!searchingEstudiantes && estudiantes.length === 0 && (
                  <div className="px-4 py-2 text-sm text-bodydark2">Sin resultados</div>
                )}

                {!searchingEstudiantes && estudiantes.map((estudiante) => (
                  <button
                    key={estudiante.id}
                    type="button"
                    onClick={() => handleSelectEstudiante(estudiante)}
                    className="w-full border-b border-stroke px-4 py-2 text-left text-sm hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    {getEstudianteLabel(estudiante)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Carrera
            </label>
            <select
              value={selectedCarreraId}
              onChange={(e) => setSelectedCarreraId(e.target.value)}
              disabled={loadingCarreras}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:bg-boxdark"
            >
              <option value="">Selecciona una carrera...</option>
              {carreras.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {getCarreraLabel(carrera)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Periodo de ingreso
            </label>
            <input
              type="text"
              value={periodoIngreso}
              onChange={(e) => setPeriodoIngreso(e.target.value)}
              placeholder="Ej: 2026-1"
              className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
            />
          </div>

          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Estado academico
            </label>
            <select
              value={estadoAcademico}
              onChange={(e) => setEstadoAcademico(e.target.value)}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
            >
              <option value="activo">Activo</option>
              <option value="retirado">Retirado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <button
            onClick={handleCreateMatricula}
            disabled={saving}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Crear Matricula'}
          </button>
        </div>
      </div>
    </>
  );
};

export default MatriculaForm;
