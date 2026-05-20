import { useAuth0 } from '@auth0/auth0-react';

const AuthUserInfo = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-4 text-sm text-bodydark2 dark:border-strokedark dark:bg-boxdark">
        Cargando sesión de GitHub...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-stroke bg-gray-100 dark:border-strokedark dark:bg-meta-4">
          <img
            src={user.picture || 'https://placehold.co/128x128?text=GH'}
            alt={user.name || 'GitHub user'}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-black dark:text-white">
            {user.name || 'Usuario de GitHub'}
          </h3>
          <p className="truncate text-sm text-bodydark2">{user.email || 'Sin email disponible'}</p>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Auth0 + GitHub</p>
        </div>
      </div>
    </div>
  );
};

export default AuthUserInfo;