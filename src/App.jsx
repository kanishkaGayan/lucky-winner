import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import WinnerPage from './pages/WinnerPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-lucky-gradient text-white font-inter">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
          <Route path="/winner" element={<WinnerPage />} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 bg-slate-950/70 px-4 py-5 text-center text-xs leading-6 text-white/65 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Organized by the Department of Project Management.</p>
          <p>Design and developed by Kanishka Meddegoda.</p>
        </div>
      </footer>
    </div>
  );
}
