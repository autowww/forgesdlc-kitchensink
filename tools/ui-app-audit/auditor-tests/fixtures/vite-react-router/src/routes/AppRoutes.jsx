import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/DashboardPage';
import Settings from '../pages/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/reports/:id" element={<Reports />} />
    </Routes>
  );
}

const routerConfig = [
  { path: '/attention', element: null },
  { path: '/check', element: null },
];
