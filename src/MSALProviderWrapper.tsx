import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './config/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

export const MSALProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MsalProvider instance={msalInstance}>{children}</MsalProvider>
);
