import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: '66d1921e-53e9-431c-ae99-5806a3bd4a1a',
    authority: 'https://login.microsoftonline.com/be802d76-7510-471a-a935-b61dbedae354',
    redirectUri: 'http://localhost:3000',
    postLogoutRedirectUri: 'http://localhost:3000',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['user.read'],
  prompt: 'select_account',
};
