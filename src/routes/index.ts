import { lazy } from 'react';



const Calendar = lazy(() => import('../pages/Calendar'));

const Chart = lazy(() => import('../pages/Chart'));

const FormElements = lazy(() => import('../pages/Form/FormElements'));

const FormLayout = lazy(() => import('../pages/Form/FormLayout'));

const Profile = lazy(() => import('../pages/Profile'));

const Settings = lazy(() => import('../pages/Settings'));

const Tables = lazy(() => import('../pages/Tables'));

const Alerts = lazy(() => import('../pages/UiElements/Alerts'));

const Buttons = lazy(() => import('../pages/UiElements/Buttons'));

const Demo= lazy(() => import('../pages/Demo'));

const ImageEditor= lazy(() => import('../pages/ImageEditor'));

const UserList= lazy(() => import('../pages/Users/ListUsers'));

const UserCreate= lazy(() => import('../pages/Users/Create'));

const UserUpdate= lazy(() => import('../pages/Users/Update'));

const RoleList= lazy(() => import('../pages/Roles/List'));

const Posts= lazy(() => import('../pages/Posts/List'));

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


const coreRoutes = [

  {

    path: '/users/list',

    title: 'Users',

    component: UserList,

  },

  {

    path: '/users/create',

    title: 'Create User',

    component: UserCreate,

  },

  {

    path: '/users/update/:id',

    title: 'Edit User',

    component: UserUpdate,

  },

  {

    path: '/posts/list',

    title: 'Posts',

    component: Posts,

  },

  {

    path: '/academic/careers/list',

    title: 'Carreras',

    component: CareerList,

  },

  {

    path: '/academic/careers/create',

    title: 'Crear Carrera',

    component: CareerCreate,

  },

  {

    path: '/academic/careers/update/:id',

    title: 'Editar Carrera',

    component: CareerUpdate,

  },

  {

    path: '/academic/semesters/list',

    title: 'Semestres',

    component: SemesterList,

  },

  {

    path: '/academic/semesters/create',

    title: 'Crear Semestre',

    component: SemesterCreate,

  },

  {

    path: '/academic/semesters/update/:id',

    title: 'Editar Semestre',

    component: SemesterUpdate,

  },

  {

    path: '/academic/study-plans',

    title: 'Planes de Estudio',

    component: StudyPlanList,

  },
  {

    path: '/academic/study-plans/edit/:id',

    title: 'Editar Plan de Estudio',

    component: StudyPlanUpdate,

  },

  {

    path: '/academic/subjects',

    title: 'Asignaturas',

    component: SubjectList,

  },

  {

    path: '/academic/subjects/create',

    title: 'Nueva Asignatura',

    component: SubjectForm,

  },

  {

    path: '/academic/subjects/edit/:id',

    title: 'Editar Asignatura',

    component: SubjectForm,

  },

  {

    path: '/academic/groups/assign-docente',

    title: 'Asignar Docente a Grupo',

    component: AssignDocente,

  },

  {

    path: '/academic/matriculas/create',

    title: 'Matricular Estudiante en Carrera',

    component: MatriculaForm,

  },

  {

    path: '/roles-list',

    title: 'Roles',

    component: RoleList,

  },

  {

    path: '/demo',

    title: 'Demo',

    component: Demo,

  },

  {

    path: '/calendar',

    title: 'Calender',

    component: Calendar,

  },

  {

    path: '/profile',

    title: 'Profile',

    component: Profile,

  },

  {

    path: '/forms/form-elements',

    title: 'Forms Elements',

    component: FormElements,

  },

  {

    path: '/forms/form-layout',

    title: 'Form Layouts',

    component: FormLayout,

  },

  {

    path: '/tables',

    title: 'Tables',

    component: Tables,

  },

  {

    path: '/settings',

    title: 'Settings',

    component: Settings,

  },

  {

    path: '/chart',

    title: 'Chart',

    component: Chart,

  },

  {

    path: '/ui/alerts',

    title: 'Alerts',

    component: Alerts,

  },

  {

    path: '/ui/buttons',

    title: 'Buttons',

    component: Buttons,

  },

  {

    path: '/image-editor',

    title: 'Image Editor',

    component: ImageEditor,

  }

];



const routes = [...coreRoutes];

export default routes;

