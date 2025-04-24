import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TeamCalendar from './pages/TeamCalendar';
import LeaveApplication from './pages/LeaveApplication';
import { LeaveHistory } from './pages/LeaveHistory';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { MSALProviderWrapper } from './MSALProviderWrapper';
import NotificationsPage from './pages/Notifications';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
  },
});

function App() {
  return (
    <MSALProviderWrapper>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider maxSnack={3}>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="apply" element={<LeaveApplication />} />
                  <Route path="history" element={<LeaveHistory />} />
                  <Route path="calendar" element={<TeamCalendar />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  {/* <Route path="users" element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <Users />
                    </ProtectedRoute>
                  } /> */}
                  <Route path="admin" element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </Router>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </MSALProviderWrapper>
  );
}

export default App;
