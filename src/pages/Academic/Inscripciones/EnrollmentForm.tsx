import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Breadcrumb from '../../../components/Breadcrumb';
import { careerService } from '../../../services/careerService';
import { grupoService } from '../../../services/grupoService';
import {
  EnrollmentApi,
  inscripcionService,
} from '../../../services/inscripcionService';
import {
  matriculaService,
  RegistrationApi,
  SearchStudentApi,
} from '../../../services/matriculaService';
import { semesterService } from '../../../services/semesterService';
import { studyPlanService } from '../../../services/studyPlanService';
import { asignaturaService } from '../../../services/asignaturaService';
import { pushNotification } from '../../../utils/notificationStore';

// Límite máximo de créditos permitidos por semestre
const MAX_CREDITS_ALLOWED = 20;

type StudentApi = SearchStudentApi & {
  is_active?: boolean;
  role?: string;
};

type CareerApi = {
  id: string;
  nombre?: string;
  codigo?: string;
  name?: string;
  code?: string;
};

type RegistrationRecord = RegistrationApi & {
  student_id?: string;
  estudiante_id?: string;
  career_id?: string;
  carrera_id?: string;
  admission_period?: string;
  periodo_ingreso?: string;
  academic_status?: string;
  estado_academico?: string;
};

type SemesterRecord = {
  id: string;
  nombre?: string;
  codigo?: string;
  name?: string;
  code?: string;
  is_active?: boolean;
  activo?: boolean;
};

type StudyPlanRecord = {
  id: string;
  career_id?: string;
  carrera_id?: string;
  name?: string;
  nombre?: string;
  year?: number | string;
  anio?: number | string;
  is_published?: boolean;
  published?: boolean;
  activo?: boolean;
};

type SubjectRecord = {
  id: string;
  nombre?: string;
  codigo?: string;
  creditos?: number;
  name?: string;
  code?: string;
  credits?: number;
};

type GroupRecord = {
  id: string;
  nombre?: string;
  codigo_grupo?: string;
  asignatura_id?: string;
  semestre_id?: string;
  cupo?: number;
  name?: string;
  group_code?: string;
  subject_id?: string;
  semester_id?: string;
  capacity?: number;
};

const ACTIVE_STATUS_VALUES = new Set(['activo', 'active']);

const pickText = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const normalizeText = (value?: string | null) =>
  (value || '').trim().toLowerCase();

const getStudentLabel = (student: StudentApi) => {
  const firstName = pickText(
    student.nombre,
    student.first_name,
    student.profile?.first_name,
  );
  const lastName = pickText(
    student.apellido,
    student.last_name,
    student.profile?.last_name,
  );
  const identification = pickText(
    student.code,
    student.codigo,
    student.user_code,
    student.cedula,
    student.identification,
    student.profile?.identification,
    'Sin codigo',
  );
  const fullName = pickText(`${firstName} ${lastName}`.trim(), 'Estudiante sin nombre');

  return `${fullName} (${identification})`;
};

const getCareerName = (career?: CareerApi | null) =>
  pickText(career?.nombre, career?.name, 'Carrera sin nombre');

const getCareerCode = (career?: CareerApi | null) =>
  pickText(career?.codigo, career?.code, 'Sin codigo');

const getCareerLabel = (career?: CareerApi | null) =>
  `${getCareerName(career)} (${getCareerCode(career)})`;

const getRegistrationStudentId = (registration: RegistrationRecord) =>
  pickText(registration.student_id, registration.estudiante_id);

const getRegistrationCareerId = (registration: RegistrationRecord) =>
  pickText(registration.career_id, registration.carrera_id);

const getRegistrationStatus = (registration: RegistrationRecord) =>
  pickText(registration.academic_status, registration.estado_academico);

const getRegistrationAdmissionPeriod = (registration: RegistrationRecord) =>
  pickText(registration.admission_period, registration.periodo_ingreso, 'Sin periodo');

const formatAcademicStatus = (status?: string) => {
  const normalized = normalizeText(status);

  if (!normalized) {
    return 'Sin estado';
  }

  if (normalized === 'activo' || normalized === 'active') {
    return 'Activo';
  }

  if (normalized === 'suspendido' || normalized === 'suspended') {
    return 'Suspendido';
  }

  if (normalized === 'retirado' || normalized === 'withdrawn') {
    return 'Retirado';
  }

  return status || 'Sin estado';
};

const isRegistrationEligible = (registration: RegistrationRecord) => {
  const status = normalizeText(getRegistrationStatus(registration));
  return (
    registration.is_active !== false &&
    (!status || ACTIVE_STATUS_VALUES.has(status))
  );
};

const getSemesterLabel = (semester?: SemesterRecord | null) => {
  const name = pickText(semester?.nombre, semester?.name, 'Semestre sin nombre');
  const code = pickText(semester?.codigo, semester?.code, 'Sin codigo');
  return `${name} (${code})`;
};

const isSemesterActive = (semester: SemesterRecord) =>
  semester.is_active === true || semester.activo === true;

const getStudyPlanCareerId = (plan: StudyPlanRecord) =>
  pickText(plan.career_id, plan.carrera_id);

const getStudyPlanYear = (plan: StudyPlanRecord) => {
  const rawYear = plan.year ?? plan.anio ?? 0;
  const parsedYear = Number(rawYear);
  return Number.isFinite(parsedYear) ? parsedYear : 0;
};

const isStudyPlanPublished = (plan: StudyPlanRecord) =>
  plan.is_published === true ||
  plan.published === true ||
  plan.activo === true;

const findApplicableStudyPlan = (
  plans: StudyPlanRecord[],
  careerId: string,
): StudyPlanRecord | null => {
  const matchingPlans = plans.filter(
    (plan) => getStudyPlanCareerId(plan) === careerId,
  );

  if (matchingPlans.length === 0) {
    return null;
  }

  const orderedPlans = [...matchingPlans].sort((left, right) => {
    const publishedDiff =
      Number(isStudyPlanPublished(right)) - Number(isStudyPlanPublished(left));

    if (publishedDiff !== 0) {
      return publishedDiff;
    }

    return getStudyPlanYear(right) - getStudyPlanYear(left);
  });

  return orderedPlans[0] || null;
};

const getSubjectName = (subject?: SubjectRecord | null) =>
  pickText(subject?.nombre, subject?.name, 'Asignatura sin nombre');

const getSubjectCode = (subject?: SubjectRecord | null) =>
  pickText(subject?.codigo, subject?.code, 'Sin codigo');

const getSubjectCredits = (subject?: SubjectRecord | null) => {
  const rawCredits = subject?.creditos ?? subject?.credits ?? 0;
  const parsedCredits = Number(rawCredits);
  return Number.isFinite(parsedCredits) ? parsedCredits : 0;
};

const getGroupName = (group: GroupRecord) =>
  pickText(group.nombre, group.name, 'Grupo sin nombre');

const getGroupCode = (group: GroupRecord) =>
  pickText(group.codigo_grupo, group.group_code, 'Sin codigo');

const getGroupLabel = (group: GroupRecord) =>
  `${getGroupName(group)} (${getGroupCode(group)})`;

const getGroupSubjectId = (group: GroupRecord) =>
  pickText(group.asignatura_id, group.subject_id);

const getGroupSemesterId = (group: GroupRecord) =>
  pickText(group.semestre_id, group.semester_id);

const getGroupCapacity = (group: GroupRecord) => {
  const rawCapacity = group.cupo ?? group.capacity ?? 0;
  const parsedCapacity = Number(rawCapacity);
  return Number.isFinite(parsedCapacity) ? parsedCapacity : 0;
};

const EnrollmentForm = () => {
  const [students, setStudents] = useState<StudentApi[]>([]);
  const [careers, setCareers] = useState<CareerApi[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [semesters, setSemesters] = useState<SemesterRecord[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlanRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [allowedSubjects, setAllowedSubjects] = useState<SubjectRecord[]>([]);
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentApi[]>([]);

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRegistrationId, setSelectedRegistrationId] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [loadingPlanSubjects, setLoadingPlanSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const careersById = useMemo(
    () => new Map(careers.map((career) => [career.id, career])),
    [careers],
  );

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const semestersById = useMemo(
    () => new Map(semesters.map((semester) => [semester.id, semester])),
    [semesters],
  );

  const activeSemesters = useMemo(
    () => semesters.filter(isSemesterActive),
    [semesters],
  );

  const activeSemesterIds = useMemo(
    () => new Set(activeSemesters.map((semester) => semester.id)),
    [activeSemesters],
  );

  const activeStudentRegistrations = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          getRegistrationStudentId(registration) === selectedStudentId &&
          isRegistrationEligible(registration),
      ),
    [registrations, selectedStudentId],
  );

  const selectedRegistration = useMemo(
    () =>
      activeStudentRegistrations.find(
        (registration) => registration.id === selectedRegistrationId,
      ) || null,
    [activeStudentRegistrations, selectedRegistrationId],
  );

  const selectedStudyPlan = useMemo(() => {
    const careerId = selectedRegistration
      ? getRegistrationCareerId(selectedRegistration)
      : '';

    if (!careerId) {
      return null;
    }

    return findApplicableStudyPlan(studyPlans, careerId);
  }, [selectedRegistration, studyPlans]);

  const selectedCareer = useMemo(() => {
    const careerId = selectedRegistration
      ? getRegistrationCareerId(selectedRegistration)
      : '';

    return careerId ? careersById.get(careerId) || null : null;
  }, [careersById, selectedRegistration]);

  const allowedSubjectIds = useMemo(
    () => new Set(allowedSubjects.map((subject) => subject.id)),
    [allowedSubjects],
  );

  const enrolledGroupIds = useMemo(
    () =>
      new Set(
        enrollments
          .filter((enrollment) => enrollment.student_id === selectedStudentId)
          .map((enrollment) => enrollment.group_id),
      ),
    [enrollments, selectedStudentId],
  );

  const activeStudentEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          enrollment.student_id === selectedStudentId &&
          normalizeText(enrollment.status || 'ACTIVE') === 'active',
      ),
    [enrollments, selectedStudentId],
  );

  const activeEnrollmentCountByGroupId = useMemo(() => {
    const counts = new Map<string, number>();

    enrollments.forEach((enrollment) => {
      if (normalizeText(enrollment.status || 'ACTIVE') !== 'active') {
        return;
      }

      counts.set(
        enrollment.group_id,
        (counts.get(enrollment.group_id) || 0) + 1,
      );
    });

    return counts;
  }, [enrollments]);

  const eligibleGroups = useMemo(() => {
    if (!selectedRegistration || allowedSubjectIds.size === 0 || activeSemesterIds.size === 0) {
      return [] as GroupRecord[];
    }

    return groups
      .filter((group) => {
        const subjectId = getGroupSubjectId(group);
        const semesterId = getGroupSemesterId(group);

        return (
          Boolean(subjectId) &&
          Boolean(semesterId) &&
          allowedSubjectIds.has(subjectId) &&
          activeSemesterIds.has(semesterId)
        );
      })
      .sort((left, right) => {
        const leftSubject = subjectsById.get(getGroupSubjectId(left));
        const rightSubject = subjectsById.get(getGroupSubjectId(right));
        const subjectCompare = getSubjectName(leftSubject).localeCompare(
          getSubjectName(rightSubject),
        );

        if (subjectCompare !== 0) {
          return subjectCompare;
        }

        return getGroupCode(left).localeCompare(getGroupCode(right));
      });
  }, [
    activeSemesterIds,
    allowedSubjectIds,
    groups,
    selectedRegistration,
    subjectsById,
  ]);

  const selectableGroupIds = useMemo(
    () =>
      new Set(
        eligibleGroups
          .filter((group) => {
            const capacity = getGroupCapacity(group);
            const currentLoad = activeEnrollmentCountByGroupId.get(group.id) || 0;
            const isFull = capacity > 0 && currentLoad >= capacity;

            return !enrolledGroupIds.has(group.id) && !isFull;
          })
          .map((group) => group.id),
      ),
    [activeEnrollmentCountByGroupId, eligibleGroups, enrolledGroupIds],
  );

  const selectedGroups = useMemo(
    () =>
      eligibleGroups.filter((group) => selectedGroupIds.includes(group.id)),
    [eligibleGroups, selectedGroupIds],
  );

  const totalSelectedCredits = useMemo(
    () =>
      selectedGroups.reduce((total, group) => {
        const subject = subjectsById.get(getGroupSubjectId(group));
        return total + getSubjectCredits(subject);
      }, 0),
    [selectedGroups, subjectsById],
  );

  const canShowSuggestions = useMemo(
    () =>
      showSuggestions &&
      !selectedStudentId &&
      studentSearch.trim().length >= 2,
    [selectedStudentId, showSuggestions, studentSearch],
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInitialData(true);

      try {
        const [
          careersData,
          registrationsResponse,
          semestersData,
          studyPlansData,
          subjectsData,
          groupsResponse,
          enrollmentsData,
        ] = await Promise.all([
          careerService.getCareers(),
          matriculaService.getRegistrations(),
          semesterService.getSemesters(),
          studyPlanService.getStudyPlans(),
          asignaturaService.getAsignaturas(),
          grupoService.getGrupos(),
          inscripcionService.getEnrollments(),
        ]);

        const registrationsList =
          registrationsResponse.data?.data || registrationsResponse.data || [];
        const groupsList = groupsResponse.data?.data || groupsResponse.data || [];

        setCareers((careersData || []) as CareerApi[]);
        setRegistrations(
          Array.isArray(registrationsList)
            ? (registrationsList as RegistrationRecord[])
            : [],
        );
        setSemesters((semestersData || []) as SemesterRecord[]);
        setStudyPlans((studyPlansData || []) as StudyPlanRecord[]);
        setSubjects((subjectsData || []) as SubjectRecord[]);
        setGroups(Array.isArray(groupsList) ? (groupsList as GroupRecord[]) : []);
        setEnrollments((enrollmentsData || []) as EnrollmentApi[]);
      } catch (error) {
        console.error('Error cargando datos para inscripciones:', error);
        toast.error('Error cargando datos para inscripciones');
      } finally {
        setLoadingInitialData(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      return;
    }

    if (studentSearch.trim().length < 2) {
      setStudents([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchingStudents(true);

      try {
        const response = await matriculaService.searchEstudiantes(
          studentSearch.trim(),
        );
        setStudents((response.data || []) as StudentApi[]);
      } catch (error) {
        console.error('Error buscando estudiantes:', error);
        setStudents([]);
      } finally {
        setSearchingStudents(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [selectedStudentId, studentSearch]);

  useEffect(() => {
    if (!selectedStudentId) {
      setSelectedRegistrationId('');
      return;
    }

    if (activeStudentRegistrations.length === 0) {
      setSelectedRegistrationId('');
      return;
    }

    setSelectedRegistrationId((currentId) => {
      const hasCurrentSelection = activeStudentRegistrations.some(
        (registration) => registration.id === currentId,
      );

      return hasCurrentSelection
        ? currentId
        : activeStudentRegistrations[0].id;
    });
  }, [activeStudentRegistrations, selectedStudentId]);

  useEffect(() => {
    const loadPlanSubjects = async () => {
      if (!selectedStudyPlan?.id) {
        setAllowedSubjects([]);
        return;
      }

      setLoadingPlanSubjects(true);

      try {
        const planSubjects = await studyPlanService.getSubjectsByStudyPlan(
          selectedStudyPlan.id,
        );
        setAllowedSubjects((planSubjects || []) as SubjectRecord[]);
      } catch (error) {
        console.error('Error cargando asignaturas del plan de estudio:', error);
        setAllowedSubjects([]);
        toast.error('Error cargando asignaturas del plan de estudio');
      } finally {
        setLoadingPlanSubjects(false);
      }
    };

    loadPlanSubjects();
  }, [selectedStudyPlan?.id]);

  useEffect(() => {
    setSelectedGroupIds((currentIds) => {
      const filteredIds = currentIds.filter((groupId) =>
        selectableGroupIds.has(groupId),
      );

      return filteredIds.length === currentIds.length
        ? currentIds
        : filteredIds;
    });
  }, [selectableGroupIds]);

  const handleStudentInput = (value: string) => {
    setStudentSearch(value);

    if (selectedStudentId) {
      setSelectedStudentId('');
      setSelectedRegistrationId('');
      setAllowedSubjects([]);
      setSelectedGroupIds([]);
    }

    setShowSuggestions(true);
  };

  const handleSelectStudent = (student: StudentApi) => {
    // Validar que el estudiante esté activo (precondición)
    if (student.is_active === false) {
      toast.error(`El estudiante ${getStudentLabel(student)} no está activo en el sistema y no puede inscribirse`);
      return;
    }

    setSelectedStudentId(student.id);
    setStudentSearch(getStudentLabel(student));
    setStudents([]);
    setShowSuggestions(false);
    setSelectedRegistrationId('');
    setAllowedSubjects([]);
    setSelectedGroupIds([]);
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds((currentIds) =>
      currentIds.includes(groupId)
        ? currentIds.filter((currentId) => currentId !== groupId)
        : [...currentIds, groupId],
    );
  };

  const resetSelection = async () => {
    setSelectedGroupIds([]);

    try {
      const refreshedEnrollments = await inscripcionService.getEnrollments();
      setEnrollments(refreshedEnrollments);
    } catch (error) {
      console.error('Error recargando inscripciones:', error);
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (!window.confirm('¿Está seguro que desea cancelar esta inscripción?')) {
      return;
    }

    try {
      await inscripcionService.cancelEnrollment(enrollmentId);
      toast.success('Inscripción cancelada correctamente');
      await resetSelection();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cancelar inscripción';
      toast.error(errorMessage);
      console.error('Error cancelando inscripción:', error);
    }
  };

  const handleCreateEnrollments = async () => {
    if (!selectedStudentId) {
      toast.error('Selecciona un estudiante');
      return;
    }

    if (!selectedRegistration) {
      toast.error('El estudiante debe tener una matrícula activa en una carrera');
      return;
    }

    if (selectedGroupIds.length === 0) {
      toast.error('Selecciona al menos un grupo');
      return;
    }

    // Validar límite de créditos máximos permitidos
    if (totalSelectedCredits > MAX_CREDITS_ALLOWED) {
      toast.error(
        `La suma de créditos (${totalSelectedCredits}) excede el límite permitido de ${MAX_CREDITS_ALLOWED} créditos por semestre`,
      );
      return;
    }

    const invalidSelection = selectedGroupIds.some(
      (groupId) => !selectableGroupIds.has(groupId),
    );

    if (invalidSelection) {
      toast.error(
        'Hay grupos seleccionados que ya no están disponibles para inscripción',
      );
      return;
    }

    setSaving(true);

    const successfulEnrollments: string[] = [];
    const failedEnrollments: string[] = [];

    for (const groupId of selectedGroupIds) {
      const group = eligibleGroups.find((currentGroup) => currentGroup.id === groupId);

      try {
        await inscripcionService.createEnrollment({
          student_id: selectedStudentId,
          group_id: groupId,
          status: 'ACTIVE',
        });

        successfulEnrollments.push(
          group ? getGroupLabel(group) : `Grupo ${groupId}`,
        );
      } catch (error: any) {
        const backendMessage =
          error.response?.data?.message || 'Error al crear la inscripción';

        failedEnrollments.push(
          `${group ? getGroupLabel(group) : `Grupo ${groupId}`}: ${backendMessage}`,
        );
      }
    }

    if (successfulEnrollments.length > 0) {
      // Notificar al estudiante inscrito
      const student = students.find((s) => s.id === selectedStudentId) || {
        id: selectedStudentId,
        code: studentSearch,
      };

      pushNotification({
        title: 'Inscripción exitosa',
        message: `Se completó la inscripción en ${successfulEnrollments.length} grupo(s): ${successfulEnrollments.join(', ')}`,
        recipientUserId: selectedStudentId,
        recipientCode: student.code || student.codigo || student.user_code,
        recipientIdentification: student.cedula || student.identification || student.profile?.identification,
      });

      toast.success(
        successfulEnrollments.length === 1
          ? 'Inscripción creada correctamente'
          : `Se crearon ${successfulEnrollments.length} inscripciones correctamente`,
      );
      await resetSelection();
    }

    if (failedEnrollments.length > 0) {
      toast.error(
        failedEnrollments.length === 1
          ? failedEnrollments[0]
          : `Algunas inscripciones fallaron (${failedEnrollments.length})`,
      );
      console.error('Errores creando inscripciones:', failedEnrollments);
    }

    setSaving(false);
  };

  return (
    <>
      <Breadcrumb pageName="Inscribir Estudiante en Grupo" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-6 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
          Gestión de Inscripciones
        </h3>
        <p className="mb-6 text-sm text-bodydark2">
          Inscribe estudiantes solo en grupos del semestre activo y que
          correspondan al plan de estudios de su carrera.
        </p>

        {loadingInitialData ? (
          <div className="py-8 text-center text-bodydark2">
            Cargando información académica...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Estudiante
              </label>
              <input
                type="text"
                value={studentSearch}
                onChange={(event) => handleStudentInput(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar estudiante por nombre, código o cédula"
                className="w-full rounded border border-stroke bg-transparent px-4 py-2.5 outline-none focus:border-primary dark:border-strokedark"
              />

              {canShowSuggestions && (
                <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  {searchingStudents && (
                    <div className="px-4 py-2 text-sm text-bodydark2">
                      Buscando...
                    </div>
                  )}

                  {!searchingStudents && students.length === 0 && (
                    <div className="px-4 py-2 text-sm text-bodydark2">
                      Sin resultados
                    </div>
                  )}

                  {!searchingStudents &&
                    students.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="w-full border-b border-stroke px-4 py-2 text-left text-sm hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                      >
                        {getStudentLabel(student)}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {selectedStudentId && (
              <div className="rounded border border-stroke bg-gray-1 p-4 dark:border-strokedark dark:bg-meta-4">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                      Matrícula activa
                    </h4>
                    <p className="text-sm text-bodydark2">
                      Selecciona la carrera activa desde la cual se validará el
                      plan de estudios.
                    </p>
                  </div>

                  {activeSemesters.length > 0 && (
                    <div className="rounded bg-success/10 px-3 py-2 text-xs font-medium text-success">
                      Semestre activo:{' '}
                      {activeSemesters.map((semester) => getSemesterLabel(semester)).join(', ')}
                    </div>
                  )}
                </div>

                {activeStudentRegistrations.length === 0 ? (
                  <div className="rounded border border-warning bg-warning/10 p-4 text-sm text-black dark:text-white">
                    <p className="mb-3">
                      El estudiante no tiene una matrícula activa en una carrera,
                      por lo que no puede inscribirse en grupos.
                    </p>
                    <Link
                      to="/academic/matriculas/create"
                      className="inline-flex rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90"
                    >
                      Ir a matricular estudiante
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2.5 block font-medium text-black dark:text-white">
                        Carrera activa
                      </label>
                      <select
                        value={selectedRegistrationId}
                        onChange={(event) => {
                          setSelectedRegistrationId(event.target.value);
                          setSelectedGroupIds([]);
                        }}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-white px-4 py-2 pl-4 pr-9 outline-none dark:border-strokedark dark:bg-boxdark"
                      >
                        {activeStudentRegistrations.map((registration) => {
                          const career = careersById.get(
                            getRegistrationCareerId(registration),
                          );

                          return (
                            <option key={registration.id} value={registration.id}>
                              {getCareerLabel(career)} - {getRegistrationAdmissionPeriod(registration)}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedRegistration && (
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
                          <span className="block text-xs text-bodydark2">Carrera</span>
                          <span className="block font-medium text-black dark:text-white">
                            {getCareerLabel(selectedCareer)}
                          </span>
                        </div>
                        <div className="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
                          <span className="block text-xs text-bodydark2">Periodo de ingreso</span>
                          <span className="block font-medium text-black dark:text-white">
                            {getRegistrationAdmissionPeriod(selectedRegistration)}
                          </span>
                        </div>
                        <div className="rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark">
                          <span className="block text-xs text-bodydark2">Estado académico</span>
                          <span className="block font-medium text-black dark:text-white">
                            {formatAcademicStatus(getRegistrationStatus(selectedRegistration))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedStudentId && selectedRegistration && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-black dark:text-white">
                      Grupos elegibles
                    </h4>
                    <p className="text-sm text-bodydark2">
                      Solo se muestran grupos del semestre activo cuya
                      asignatura pertenezca al plan de estudios de la carrera
                      seleccionada.
                    </p>
                  </div>

                  {selectedStudyPlan && (
                    <div className="rounded bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                      Plan aplicado:{' '}
                      {pickText(selectedStudyPlan.nombre, selectedStudyPlan.name, 'Plan')}
                      {' '}({getStudyPlanYear(selectedStudyPlan)})
                    </div>
                  )}
                </div>

                {activeSemesters.length === 0 ? (
                  <div className="rounded border border-warning bg-warning/10 p-4 text-sm text-black dark:text-white">
                    No hay un semestre activo configurado en el sistema.
                  </div>
                ) : !selectedStudyPlan ? (
                  <div className="rounded border border-warning bg-warning/10 p-4 text-sm text-black dark:text-white">
                    No se encontró un plan de estudios aplicable para la carrera
                    seleccionada.
                  </div>
                ) : loadingPlanSubjects ? (
                  <div className="rounded border border-stroke bg-gray-1 p-4 text-sm text-bodydark2 dark:border-strokedark dark:bg-meta-4">
                    Cargando asignaturas del plan de estudios...
                  </div>
                ) : eligibleGroups.length === 0 ? (
                  <div className="rounded border border-stroke bg-gray-1 p-4 text-sm text-bodydark2 dark:border-strokedark dark:bg-meta-4">
                    No hay grupos del semestre activo que pertenezcan al plan de
                    estudios de la carrera seleccionada. Si el estudiante ya
                    aparece inscrito en alguna asignatura, revisa la sección
                    "Inscripciones activas del estudiante" más abajo para ver
                    los grupos en los que ya está inscrito.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eligibleGroups.map((group) => {
                      const subject = subjectsById.get(getGroupSubjectId(group));
                      const semester = semestersById.get(getGroupSemesterId(group));
                      const currentLoad =
                        activeEnrollmentCountByGroupId.get(group.id) || 0;
                      const capacity = getGroupCapacity(group);
                      const alreadyEnrolled = enrolledGroupIds.has(group.id);
                      const isFull = capacity > 0 && currentLoad >= capacity;
                      const disabled = alreadyEnrolled || isFull;

                      return (
                        <label
                          key={group.id}
                          className={`flex cursor-pointer items-start gap-4 rounded border p-4 ${
                            disabled
                              ? 'border-stroke bg-gray-1 opacity-70 dark:border-strokedark dark:bg-meta-4'
                              : 'border-stroke bg-white hover:border-primary dark:border-strokedark dark:bg-boxdark'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() => handleToggleGroup(group.id)}
                            disabled={disabled || saving}
                            className="mt-1 h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                          />

                          <div className="flex-1">
                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium text-black dark:text-white">
                                  {getSubjectName(subject)}
                                </p>
                                <p className="text-sm text-bodydark2">
                                  {getGroupLabel(group)} - Código asignatura:{' '}
                                  {getSubjectCode(subject)}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                  {getSubjectCredits(subject)} créditos
                                </span>
                                <span className="rounded bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                  {getSemesterLabel(semester)}
                                </span>
                                <span className="rounded bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                                  Cupos: {currentLoad}/{capacity || 'N/D'}
                                </span>
                                {alreadyEnrolled && (
                                  <span className="rounded bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                                    Ya inscrito
                                  </span>
                                )}
                                {isFull && !alreadyEnrolled && (
                                  <span className="rounded bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                                    Sin cupos
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedRegistration && selectedGroups.length > 0 && (
              <div className="rounded border border-primary bg-primary/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {selectedGroups.length} grupo(s) seleccionado(s)
                    </p>
                    <p className="text-sm text-bodydark2">
                      Total de créditos seleccionados: {totalSelectedCredits} / {MAX_CREDITS_ALLOWED} máximo
                    </p>
                  </div>

                  <button
                    onClick={handleCreateEnrollments}
                    disabled={saving || totalSelectedCredits > MAX_CREDITS_ALLOWED}
                    className="inline-flex justify-center rounded bg-primary px-5 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {saving ? 'Inscribiendo...' : 'Inscribir en grupos seleccionados'}
                  </button>
                </div>
              </div>
            )}

            {selectedStudentId && activeStudentEnrollments.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-black dark:text-white">
                    Inscripciones activas del estudiante
                  </h4>
                  <div className="space-y-2">
                    {activeStudentEnrollments.map((enrollment) => {
                      const enrollmentGroup = groups.find((g) => g.id === enrollment.group_id);
                      const enrollmentSubject = subjectsById.get(
                        getGroupSubjectId(enrollmentGroup),
                      );

                      return (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between rounded border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark"
                        >
                          <div>
                            <p className="text-sm font-medium text-black dark:text-white">
                              {getSubjectName(enrollmentSubject)}
                            </p>
                            <p className="text-xs text-bodydark2">
                              {enrollmentGroup ? getGroupLabel(enrollmentGroup) : 'Grupo no disponible'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                            className="rounded bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20"
                          >
                            Cancelar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
};

export default EnrollmentForm;
