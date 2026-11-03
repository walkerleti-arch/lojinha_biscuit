import { Navigate, Route, Routes } from 'react-router-dom';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Analise from './pages/Analise';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cadastro" replace />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/analise" element={<Analise />} />
      <Route path="*" element={<Navigate to="/cadastro" replace />} />
    </Routes>
  );
}