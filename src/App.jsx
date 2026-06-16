import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import WinnerPage from './pages/WinnerPage';

export default function App() {
  return (
    <div className="min-h-screen bg-lucky-gradient text-white font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
        <Route path="/winner" element={<WinnerPage />} />
      </Routes>
    </div>
  );
}
