import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { extractRoleFromObject, isStudentRole } from "../../utils/roleUtils";

type StudentOnlyProps = { children: ReactNode };

const StudentOnly = ({ children }: StudentOnlyProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (!isStudentRole(extractRoleFromObject(user))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default StudentOnly;
