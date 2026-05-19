import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { extractRoleFromObject } from "../../utils/roleUtils";
import { UserRole } from "../../utils/roleUtils";

type RoleGuardProps = {
    children: ReactNode;
    allowedRoles: UserRole[];
};

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    const userRole = extractRoleFromObject(user);
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
