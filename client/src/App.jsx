import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/manager/Users';
import Zones from './pages/manager/Zones';
import Duties from './pages/manager/Duties';
import Reports from './pages/manager/Reports';
import MyDuties from './pages/employee/MyDuties';
import DutyDetail from './pages/employee/DutyDetail';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/manager/users" element={
            <ProtectedRoute roles={['manager']}><Users /></ProtectedRoute>
          } />
          <Route path="/manager/zones" element={
            <ProtectedRoute roles={['manager']}><Zones /></ProtectedRoute>
          } />
          <Route path="/manager/duties" element={
            <ProtectedRoute roles={['manager']}><Duties /></ProtectedRoute>
          } />
          <Route path="/manager/reports" element={
            <ProtectedRoute roles={['manager']}><Reports /></ProtectedRoute>
          } />

          <Route path="/employee/duties" element={
            <ProtectedRoute roles={['employee']}><MyDuties /></ProtectedRoute>
          } />
          <Route path="/employee/duties/:id" element={
            <ProtectedRoute roles={['employee']}><DutyDetail /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
