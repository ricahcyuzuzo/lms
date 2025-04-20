import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TeamCalendar from './pages/TeamCalendar';
import LeaveApplication from './pages/LeaveApplication';
import LeaveHistory from './pages/LeaveHistory';
import Login from './pages/Login';
import Layout from './components/Layout';
import { MSALProviderWrapper } from './MSALProviderWrapper';

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
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="apply" element={<LeaveApplication />} />
                  <Route path="history" element={<LeaveHistory />} />
                  <Route path="calendar" element={<TeamCalendar />} />
                  <Route path="admin" element={<AdminPanel />} />
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
