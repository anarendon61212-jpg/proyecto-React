import type { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0CallbackUrl } from './auth0Config';

type AuthProviderProps = {
  children: ReactNode;
};

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      onRedirectCallback={(appState) => {
        const targetUrl = appState?.returnTo || '/auth/signin';
        window.history.replaceState({}, document.title, targetUrl);
      }}
      authorizationParams={{
        redirect_uri: auth0CallbackUrl,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={false}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;