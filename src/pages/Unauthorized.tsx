import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb pageName="Acceso Denegado" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              No tienes permiso
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              No tienes autorización para acceder a esta página.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-opacity-90"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;
