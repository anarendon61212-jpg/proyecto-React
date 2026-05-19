import { User } from "../models/User";

/**
 * Validates if a teacher owns/teaches the specified group
 * In a real implementation, this would query the groups table in Firestore
 * @param teacher - Teacher user object
 * @param groupId - Group ID to check
 * @returns boolean - True if teacher teaches this group
 */
export const isTeacherOfGroup = (teacher: User, groupId: string): boolean => {
  // Placeholder: This should query Firestore/backend
  // SELECT * FROM groups WHERE teacher_id = teacher.id AND id = groupId
  return false;
};

/**
 * Validates if a student is enrolled in the specified group
 * In a real implementation, this would query the enrollments table in Firestore
 * @param student - Student user object
 * @param groupId - Group ID to check
 * @returns boolean - True if student is enrolled in this group
 */
export const isStudentInGroup = (student: User, groupId: string): boolean => {
  // Placeholder: This should query Firestore/backend
  // SELECT * FROM enrollments WHERE student_id = student.id AND group_id = groupId
  return false;
};

/**
 * Validates if a user can access a specific grade record based on their role
 * @param user - User object
 * @param gradeUserId - ID of the user who owns the grade
 * @param userRole - Role of the current user
 * @returns boolean - True if user can access this grade
 */
export const canAccessGrade = (user: User, gradeUserId: string, userRole: string): boolean => {
  // ADMIN can access any grade
  if (userRole === 'ADMIN') return true;

  // STUDENT can only access their own grades
  if (userRole === 'STUDENT') return user.id === gradeUserId;

  // TEACHER can access grades of students in their groups
  // This requires additional validation: check if the grade belongs to a student in the teacher's groups
  if (userRole === 'TEACHER') {
    // Placeholder: Query to verify ownership
    // SELECT * FROM grades WHERE id = gradeId AND group_id IN (
    //   SELECT id FROM groups WHERE teacher_id = user.id
    // )
    return false; // Should be validated at page level
  }

  return false;
};

/**
 * Validates if a user can access an evaluation/grading interface
 * @param user - User object
 * @param evaluationId - Evaluation ID to check
 * @param userRole - Role of the current user
 * @returns boolean - True if user can access this evaluation
 */
export const canAccessEvaluation = (user: User, evaluationId: string, userRole: string): boolean => {
  // ADMIN can access any evaluation
  if (userRole === 'ADMIN') return true;

  // TEACHER can only access evaluations in their groups
  if (userRole === 'TEACHER') {
    // Placeholder: Query to verify ownership
    // SELECT * FROM evaluations WHERE id = evaluationId AND group_id IN (
    //   SELECT id FROM groups WHERE teacher_id = user.id
    // )
    return false; // Should be validated at page level
  }

  return false;
};

/**
 * Filters grades to show only accessible ones for the user
 * @param grades - Array of grade objects
 * @param user - User object
 * @param userRole - Role of the current user
 * @returns Array of grades the user can access
 */
export const filterAccessibleGrades = (grades: any[], user: User, userRole: string): any[] => {
  if (userRole === 'ADMIN') {
    // Admin sees all grades
    return grades;
  }

  if (userRole === 'STUDENT') {
    // Student sees only their own grades
    return grades.filter(grade => grade.student_id === user.id || grade.userId === user.id);
  }

  if (userRole === 'TEACHER') {
    // Teacher sees only grades from students in their groups
    // This requires joining with groups and enrollments tables
    // Placeholder: actual filtering should happen in the backend
    return [];
  }

  return [];
};
