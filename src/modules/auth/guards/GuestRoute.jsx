import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';


export default function GuestRoute() {

  const {
    user,
    isAuthenticated,
    authLoading,
  } =
    useAuth();


  if (authLoading) {

    return null;
  }


  if (
    isAuthenticated &&
    user
  ) {

    /*
     * ADMIN
     */

    if (
      user.role ===
      'admin'
    ) {

      return (

        <Navigate
          to="/admin"
          replace
        />

      );
    }


    /*
     * CUSTOMER
     */

    return (

      <Navigate
        to="/account"
        replace
      />

    );
  }


  return <Outlet />;
}