import { lazy } from 'react';
import { UserRole } from '../utils/roleUtils';

const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo = lazy(() => import('../pages/Demo'));
const ImageEditor = lazy(() => import('../pages/ImageEditor'));
const UserList = lazy(() => import('../pages/Users/ListUsers'));
const UserCreate = lazy(() => import('../pages/Users/Create'));
const UserUpdate = lazy(() => import('../pages/Users/Update'));
const RoleList = lazy(() => import('../pages/Roles/List'));
const Posts = lazy(() => import('../pages/Posts/List'));
const CareerList = lazy(() => import('../pages/Academic/Careers/CareerList'));
const CareerCreate = lazy(() => import('../pages/Academic/Careers/Create'));
const CareerUpdate = lazy(() => import('../pages/Academic/Careers/Update'));
const SemesterList = lazy(() => import('../pages/Academic/Semesters/SemesterList'));
const SemesterCreate = lazy(() => import('../pages/Academic/Semesters/Create'));
const SemesterUpdate = lazy(() => import('../pages/Academic/Semesters/Update'));
const StudyPlanList = lazy(() => import('../pages/Academic/StudyPlans/StudyPlanList'));
const StudyPlanUpdate = lazy(() => import('../pages/Academic/StudyPlans/Update'));
const SubjectList = lazy(() => import('../pages/Academic/Subjects/SubjectList'));
const SubjectForm = lazy(() => import('../pages/Academic/Subjects/SubjectForm'));
const AssignDocente = lazy(() => import('../pages/Academic/Groups/AssignDocente'));
const MatriculaForm = lazy(() => import('../pages/Academic/Matriculas/MatriculaForm'));
const EnrollmentForm = lazy(() => import('../pages/Academic/Inscripciones/EnrollmentForm'));
const RubricManager = lazy(() => import('../pages/Evaluation/Rubrics/RubricManager'));
const EvaluationRubricAssociation = lazy(() => import('../pages/Evaluation/Associations/EvaluationRubricAssociation'));
const StudentGradesPage = lazy(() => import('../pages/Evaluation/StudentGrades/StudentGradesPage'));
const FinalGradesPage = lazy(() => import('../pages/FinalGrades/FinalGradesPage'));
const FinalGradesByGroupPage = lazy(() => import('../pages/FinalGrades/FinalGradesByGroupPage'));

export interface RouteConfig {
  path: string;
  title: string;
  component: React.LazyExoticComponent<any>;
  requiredRoles?: UserRole[];
}

const coreRoutes: RouteConfig[] = [
  // ===== ADMIN ONLY (HU-01: Manage users) =====
  { path: '/users/list', title: 'Users', component: UserList, requiredRoles: ['ADMIN'] },
  { path: '/users/create', title: 'Create User', component: UserCreate, requiredRoles: ['ADMIN'] },
  { path: '/users/update/:id', title: 'Edit User', component: UserUpdate, requiredRoles: ['ADMIN'] },
  { path: '/roles-list', title: 'Roles', component: RoleList, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-02: Manage careers and semesters) =====
  { path: '/academic/careers/list', title: 'Carreras', component: CareerList, requiredRoles: ['ADMIN'] },
  { path: '/academic/careers/create', title: 'Crear Carrera', component: CareerCreate, requiredRoles: ['ADMIN'] },
  { path: '/academic/careers/update/:id', title: 'Editar Carrera', component: CareerUpdate, requiredRoles: ['ADMIN'] },
  { path: '/academic/semesters/list', title: 'Semestres', component: SemesterList, requiredRoles: ['ADMIN'] },
  { path: '/academic/semesters/create', title: 'Crear Semestre', component: SemesterCreate, requiredRoles: ['ADMIN'] },
  { path: '/academic/semesters/update/:id', title: 'Editar Semestre', component: SemesterUpdate, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-03: Manage study plans) =====
  { path: '/academic/study-plans', title: 'Planes de Estudio', component: StudyPlanList, requiredRoles: ['ADMIN'] },
  { path: '/academic/study-plans/edit/:id', title: 'Editar Plan de Estudio', component: StudyPlanUpdate, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-04: Manage subjects) =====
  { path: '/academic/subjects', title: 'Asignaturas', component: SubjectList, requiredRoles: ['ADMIN'] },
  { path: '/academic/subjects/create', title: 'Nueva Asignatura', component: SubjectForm, requiredRoles: ['ADMIN'] },
  { path: '/academic/subjects/edit/:id', title: 'Editar Asignatura', component: SubjectForm, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-05: Assign docente to group) =====
  { path: '/academic/groups/assign-docente', title: 'Asignar Docente a Grupo', component: AssignDocente, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-06: Matriculate student) =====
  { path: '/academic/matriculas/create', title: 'Matricular Estudiante en Carrera', component: MatriculaForm, requiredRoles: ['ADMIN'] },

  // ===== ADMIN ONLY (HU-07: Inscribe student in group) =====
  { path: '/academic/inscripciones/create', title: 'Inscribir Estudiante en Grupo', component: EnrollmentForm, requiredRoles: ['ADMIN'] },

  // ===== ADMIN + TEACHER (HU-08, HU-09, HU-10: Create rubrics) =====
  { path: '/evaluation/rubrics', title: 'Rubricas de Evaluacion', component: RubricManager, requiredRoles: ['ADMIN', 'TEACHER'] },

  // ===== ADMIN + TEACHER (HU-10: Associate rubric to evaluation) =====
  { path: '/evaluation/associations', title: 'Asociar Rubrica a Evaluacion', component: EvaluationRubricAssociation, requiredRoles: ['ADMIN', 'TEACHER'] },

  // ===== ALL ROLES (HU-13, HU-14: View grades and rubrics) =====
  { path: '/student-grades', title: 'Mis Calificaciones', component: StudentGradesPage },
  { path: '/final-grades', title: 'Notas Finales', component: FinalGradesPage },
  { path: '/final-grades/:groupId', title: 'Consolidado de Grupo', component: FinalGradesByGroupPage },

  // ===== ALL ROLES (Unprotected routes - no role restriction) =====
  { path: '/posts/list', title: 'Posts', component: Posts },
  { path: '/profile', title: 'Profile', component: Profile },
  { path: '/forms/form-elements', title: 'Forms Elements', component: FormElements },
  { path: '/forms/form-layout', title: 'Form Layouts', component: FormLayout },
  { path: '/settings', title: 'Settings', component: Settings },
  { path: '/chart', title: 'Chart', component: Chart },
  { path: '/ui/alerts', title: 'Alerts', component: Alerts },
  { path: '/ui/buttons', title: 'Buttons', component: Buttons },
  { path: '/image-editor', title: 'Image Editor', component: ImageEditor },
  { path: '/demo', title: 'Demo', component: Demo },
];

const routes = [...coreRoutes];

export default routes;
