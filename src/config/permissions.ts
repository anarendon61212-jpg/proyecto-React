import { UserRole } from "../utils/roleUtils";

// Permission constants aligned with user stories (HU-01 to HU-14)
export const PERMISSIONS = {
  // HU-01: Manage users
  USERS_MANAGE: 'users.manage',

  // HU-02: Manage careers and semesters
  CAREERS_MANAGE: 'careers.manage',
  SEMESTERS_MANAGE: 'semesters.manage',

  // HU-03: Manage study plans
  STUDYPLANS_MANAGE: 'studyplans.manage',

  // HU-04: Manage subjects
  SUBJECTS_MANAGE: 'subjects.manage',
  SUBJECTS_READ: 'subjects.read',

  // HU-05: Assign docente to group
  GROUPS_MANAGE: 'groups.manage',
  GROUPS_ASSIGNDOCENTE: 'groups.assigndocente',

  // HU-06, HU-07: Manage enrollments and inscriptions
  ENROLLMENTS_MANAGE: 'enrollments.manage',

  // HU-08, HU-09: Create and manage rubrics
  RUBRICS_MANAGE: 'rubrics.manage',
  RUBRICS_READ: 'rubrics.read',

  // HU-10: Associate rubric to evaluation
  EVALUATIONS_MANAGE: 'evaluations.manage',

  // HU-11, HU-12: Grade students and register final grades
  GRADES_MANAGE: 'grades.manage',
  GRADES_READ_OWN: 'grades.read.own',

  // HU-13, HU-14: View reports and download own reports
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_DOWNLOAD_OWN: 'reports.download.own',
} as const;

// Role-permission mapping aligned with user stories and business rules
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // ADMIN: Has all permissions (HU-01 to HU-07)
  ADMIN: [
    // HU-01: Manage users
    PERMISSIONS.USERS_MANAGE,

    // HU-02: Manage careers and semesters
    PERMISSIONS.CAREERS_MANAGE,
    PERMISSIONS.SEMESTERS_MANAGE,

    // HU-03: Manage study plans
    PERMISSIONS.STUDYPLANS_MANAGE,

    // HU-04: Manage subjects
    PERMISSIONS.SUBJECTS_MANAGE,
    PERMISSIONS.SUBJECTS_READ,

    // HU-05: Assign docente to group
    PERMISSIONS.GROUPS_MANAGE,
    PERMISSIONS.GROUPS_ASSIGNDOCENTE,

    // HU-06, HU-07: Manage enrollments
    PERMISSIONS.ENROLLMENTS_MANAGE,

    // Can also manage evaluations and grades
    PERMISSIONS.RUBRICS_MANAGE,
    PERMISSIONS.RUBRICS_READ,
    PERMISSIONS.EVALUATIONS_MANAGE,
    PERMISSIONS.GRADES_MANAGE,
    PERMISSIONS.GRADES_READ_OWN,
    PERMISSIONS.REPORTS_GENERATE,
  ],

  // TEACHER: Can manage evaluation and grading (HU-08 to HU-12)
  TEACHER: [
    // HU-08, HU-09: Create and manage rubrics
    PERMISSIONS.RUBRICS_MANAGE,
    PERMISSIONS.RUBRICS_READ,

    // HU-10: Associate rubric to evaluation
    PERMISSIONS.EVALUATIONS_MANAGE,

    // HU-11, HU-12: Grade students and register final grades
    PERMISSIONS.GRADES_MANAGE,
    PERMISSIONS.GRADES_READ_OWN,

    // Read-only access to subjects
    PERMISSIONS.SUBJECTS_READ,

    // Can generate reports
    PERMISSIONS.REPORTS_GENERATE,
  ],

  // STUDENT: Can only view own information (HU-13, HU-14)
  STUDENT: [
    // HU-13: Consult rubric (read-only, own only)
    PERMISSIONS.RUBRICS_READ,

    // HU-14: View own grades and download reports
    PERMISSIONS.GRADES_READ_OWN,
    PERMISSIONS.REPORTS_DOWNLOAD_OWN,
  ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
