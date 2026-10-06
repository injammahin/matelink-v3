import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';


export default function ProtectedRoute() {

  const {
    user,
    isAuthenticated,
    authLoading,
  } =
    useAuth();


  const location =
    useLocation();


  if (authLoading) {

    return (
      <div className="auth-route-loading">
        Loading…
      </div>
    );
  }


  if (
    !isAuthenticated ||
    !user
  ) {

    return (

      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />

    );
  }


  return <Outlet />;
}