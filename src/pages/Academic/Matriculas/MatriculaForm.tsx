import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { matriculaService, RegistrationApi, SemesterApi } from '../../../services/matriculaService';
import RegistrationList from './RegistrationList';
import { pushNotification } from '../../../utils/notificationStore';

type CarreraApi = {
  id: string;
  nombre?: string;
  codigo?: string;
  name?: string;
  code?: string;
};

type EstudianteApi = {
  id: string;
  user_id?: string;
  role?: string;
  is_active?: boolean;
  code?: string;
  codigo?: string;
  user_code?: string;
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
  const codigo = estudiante.code || estudiante.codigo || estudiante.user_code || estudiante.cedula || estudiante.identification || estudiante.profile?.identification || 'Sin codigo';
  const fullName = `${nombre} ${apellido}`.trim() || 'Estudiante sin nombre';
  return `${fullName} (${codigo})`;
};

const MatriculaForm = () => {
  const [carreras, setCarreras] = useState<CarreraApi[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteApi[]>([]);

  const [selectedEstudianteId, setSelectedEstudianteId] = useState<string>('');
  const [selectedCarreraId, setSelectedCarreraId] = useState<string>('');
  const [periodoIngreso, setPeriodoIngreso] = useState<string>('');
  const [estadoAcademico, setEstadoAcademico] = useState<string>('activo');
  const [estudianteSearch, setEstudianteSearch] = useState<string>('');
  const [validPeriods, setValidPeriods] = useState<Set<string>>(new Set());

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [searchingEstudiantes, setSearchingEstudiantes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

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

    const loadSemesters = async () => {
      try {
        const response = await matriculaService.getSemesters();
        const semestersList = response.data?.data || response.data || [];

        // Extraer los periodos válidos del formato de los semestres
        const periods = new Set<string>();
        if (Array.isArray(semestersList)) {
          semestersList.forEach((semester: SemesterApi) => {
            // Usar el código del semestre si está disponible
            if (semester.code) {
              periods.add(semester.code);
            }
            // También puede usar el nombre si sigue el formato YYYY-N
            if (semester.name && /^\d{4}-\d+$/.test(semester.name)) {
              periods.add(semester.name);
            }
          });
        }
        setValidPeriods(periods);
      } catch (error) {
        console.error('Error cargando semestres:', error);
        // No mostrar error, permitir que el usuario continúe con validación de formato
      }
    };

    loadCarreras();
    loadSemesters();
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
        setEstudiantes(response.data || []);
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
    const normalizedPeriodoIngreso = periodoIngreso.trim();

    if (
      !selectedEstudianteId ||
      !selectedCarreraId ||
      !normalizedPeriodoIngreso ||
      !estadoAcademico
    ) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    if (!/^\d{4}-\d+$/.test(normalizedPeriodoIngreso)) {
      toast.error('El periodo de ingreso debe tener formato YYYY-N, por ejemplo 2026-1');
      return;
    }

    // Validar contra semestres existentes en el sistema
    if (validPeriods.size > 0 && !validPeriods.has(normalizedPeriodoIngreso)) {
      toast.error('El periodo ingresado no corresponde a un semestre registrado en el sistema');
      return;
    }

    try {
      const registrationsResponse = await matriculaService.getRegistrations();
      const registrations = registrationsResponse.data?.data || registrationsResponse.data || [];

      if (Array.isArray(registrations)) {
        const activeRegistration = registrations.find((registration: RegistrationApi) => {
          return (
            registration.student_id === selectedEstudianteId &&
            registration.career_id === selectedCarreraId &&
            registration.is_active !== false
          );
        });

        if (activeRegistration) {
          toast.error('El estudiante ya tiene una matrícula activa en esta carrera');
          return;
        }
      }
    } catch (error) {
      console.error('Error verificando matrículas existentes:', error);
    }

    setSaving(true);
    try {
      const response = await matriculaService.createMatricula({
        student_id: selectedEstudianteId,
        career_id: selectedCarreraId,
        admission_period: normalizedPeriodoIngreso,
        academic_status: estadoAcademico,
      });

      const successMessage = response.data?.message || 'Matricula creada correctamente';
      toast.success(successMessage);
      const selectedEstudiante = estudiantes.find((estudiante) => estudiante.id === selectedEstudianteId);
      const selectedCarrera = carreras.find((carrera) => carrera.id === selectedCarreraId);
      pushNotification({
        title: 'Matrícula registrada',
        message: `${getEstudianteLabel(selectedEstudiante || { id: selectedEstudianteId })} fue matriculado en ${getCarreraLabel(selectedCarrera || { id: selectedCarreraId })} para el período ${normalizedPeriodoIngreso}.`,
        recipientUserId: selectedEstudiante?.user_id,
        recipientCode: selectedEstudiante?.code || selectedEstudiante?.codigo || selectedEstudiante?.user_code,
        recipientIdentification:
          selectedEstudiante?.cedula ||
          selectedEstudiante?.identification ||
          selectedEstudiante?.profile?.identification,
      });
      resetForm();
    } catch (error: any) {
      console.error('Respuesta de error del backend:', error.response?.data);
      const backendMessage = error.response?.data?.message;
      const errorMessage = backendMessage || 'Error al crear matricula';
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
          Gestión de Matrículas
        </h3>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'create'
                ? 'border-b-2 border-primary text-primary'
                : 'text-bodydark'
            }`}
          >
            Crear Nueva Matrícula
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'edit'
                ? 'border-b-2 border-primary text-primary'
                : 'text-bodydark'
            }`}
          >
            Editar Matrículas Existentes
          </button>
        </div>

        {/* Tab: Crear nueva matrícula */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="relative">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Estudiante
              </label>
              <input
                type="text"
                value={estudianteSearch}
                onChange={(e) => handleEstudianteInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar estudiante por nombre, código o cédula"
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
              {validPeriods.size > 0 && (
                <p className="mt-1 text-xs text-bodydark2">
                  Períodos válidos: {Array.from(validPeriods).join(', ')}
                </p>
              )}
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
        )}

        {/* Tab: Editar matrículas existentes */}
        {activeTab === 'edit' && (
          <div>
            <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Matrículas Registradas
            </h4>
            <RegistrationList />
          </div>
        )}
      </div>
    </>
  );
};

export default MatriculaForm;
