export const auth0CallbackUrl = window.location.origin + '/auth/signin';

export const auth0Connection = import.meta.env.VITE_AUTH0_CONNECTION || 'github';