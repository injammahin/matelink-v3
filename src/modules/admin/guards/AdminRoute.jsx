import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';

import {
  getAuthToken,
} from '@/shared/api/client';


export default function AdminRoute() {
  const location =
    useLocation();

  const {
    user,
    authLoading,
  } = useAuth();


  /*
  |--------------------------------------------------------------------------
  | WAIT FOR AUTH CHECK
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f5f7f8',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <div className="admin-auth-spinner" />

          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: '#607582',
            }}
          >
            Checking administrator access…
          </p>
        </div>
      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | READ TOKEN DIRECTLY
  |--------------------------------------------------------------------------
  |
  | Do not trust only `user`.
  |
  | A stale user object must never give access if
  | the Bearer token has already been removed.
  |
  */

  const token =
    getAuthToken();


  /*
  |--------------------------------------------------------------------------
  | NOT LOGGED IN
  |--------------------------------------------------------------------------
  */

  if (
    !token ||
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


  /*
  |--------------------------------------------------------------------------
  | LOGGED IN BUT NOT ADMIN
  |--------------------------------------------------------------------------
  */

  if (
    String(
      user.role || ''
    ).toLowerCase() !==
    'admin'
  ) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | AUTHORIZED ADMIN
  |--------------------------------------------------------------------------
  */

  return <Outlet />;
}