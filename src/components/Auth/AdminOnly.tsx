import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { extractRoleFromObject, isAdminRole } from "../../utils/roleUtils";

type AdminOnlyProps = {
    children: ReactNode;
};

const AdminOnly = ({ children }: AdminOnlyProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (!isAdminRole(extractRoleFromObject(user))) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminOnly;
