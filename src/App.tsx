import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { theme } from './theme';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Ventes } from './pages/Ventes';
import { Stock } from './pages/Stock';
import { Produits } from './pages/Produits';
import { Rapports } from './pages/Rapports';
import { Onboarding } from './pages/Onboarding';
import { Register } from './pages/Register';
import { useAuthStore } from './store';
import React from 'react';
import { AppLayout } from './layouts/AppLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="stock" element={<Stock />} />
            <Route path="produits" element={<Produits />} />
            <Route path="rapports" element={<Rapports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
