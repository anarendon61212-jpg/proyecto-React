import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { extractRoleFromObject, isTeacherRole } from "../../utils/roleUtils";

type TeacherOnlyProps = { children: ReactNode };

const TeacherOnly = ({ children }: TeacherOnlyProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (!isTeacherRole(extractRoleFromObject(user))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default TeacherOnly;
