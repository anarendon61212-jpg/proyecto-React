import { useAuth0 } from '@auth0/auth0-react';
import SecurityService from '../../services/securityService';

const LogoutButton = () => {
  const { isAuthenticated, logout } = useAuth0();

  const handleLogout = async () => {
    await SecurityService.logout();

    if (isAuthenticated) {
      await logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      return;
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;