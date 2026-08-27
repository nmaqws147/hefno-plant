import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from './FullPageLoader';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/blog',
  '/privacy',
  '/terms',
  '/about',
];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) =>
    matchPath({ path: route, end: true }, pathname)
  );
}

export default function AppRouteGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!user && !isPublicRoute(location.pathname)) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
