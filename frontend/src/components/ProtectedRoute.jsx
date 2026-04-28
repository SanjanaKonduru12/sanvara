import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ auth, children }) {
  const location = useLocation();

  if (!auth) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
}
