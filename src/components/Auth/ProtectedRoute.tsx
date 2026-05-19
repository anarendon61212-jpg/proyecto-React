import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

// Componente de Ruta Protegida
const ProtectedRoute = () => {
    const user = useSelector((state: RootState) => {
        console.log("PROTECTEDROUTE - Leyendo Redux state:", state.user);
        return state.user.user;
    });

    console.log("PROTECTEDROUTE - USER RESULTADO:", user);
    console.log("PROTECTEDROUTE - USER ROLE:", user?.role);
    console.log("PROTECTEDROUTE - SERA OUTLET?:", !!user);

    return user ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;