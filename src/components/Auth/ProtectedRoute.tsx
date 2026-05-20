import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth0 } from '@auth0/auth0-react';
import { RootState } from "../../store/store";
import Loader from '../../common/Loader';

// Componente de Ruta Protegida
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth0();
    const user = useSelector((state: RootState) => {
        console.log("PROTECTEDROUTE - Leyendo Redux state:", state.user);
        return state.user.user;
    });

    if (isLoading) {
        return <Loader />;
    }

    console.log("PROTECTEDROUTE - USER RESULTADO:", user);
    console.log("PROTECTEDROUTE - USER ROLE:", user?.role);
    console.log("PROTECTEDROUTE - AUTH0?:", isAuthenticated);
    console.log("PROTECTEDROUTE - SERA OUTLET?:", !!user || isAuthenticated);

    return user || isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;