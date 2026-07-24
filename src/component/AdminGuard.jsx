import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from './FullPageLoader';

export default function AdminGuard({ children, fallbackPath = '/' }) {
  const { loading, isAdmin } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!isAdmin) return <Navigate to={fallbackPath} replace />;
  return children;
}
