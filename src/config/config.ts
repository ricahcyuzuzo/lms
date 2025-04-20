export const config = {
  apiBaseUrl: 'https://api.example.com', // Replace with your actual API URL
  msalConfig: {
    auth: {
      clientId: process.env.REACT_APP_MSAL_CLIENT_ID || '', // Replace with your Azure AD client ID
      authority: process.env.REACT_APP_MSAL_AUTHORITY || 'https://login.microsoftonline.com/common', // Replace with your tenant ID
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  },
  leaveTypes: {
    PTO: 'Personal Time Off',
    SICK: 'Sick Leave',
    COMPASSIONATE: 'Compassionate Leave',
    MATERNITY: 'Maternity Leave',
    UNPAID: 'Unpaid Leave',
  },
  maxCarryForwardDays: 5,
  annualLeaveEntitlement: 20,
  monthlyAccrualRate: 1.66,
};
