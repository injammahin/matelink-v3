import {
  Fragment,
} from 'react';

import {
  Route,
} from 'react-router-dom';

import SiteLayout from '@/modules/frontend/layouts/SiteLayout';

import GuestRoute from '@/modules/auth/guards/GuestRoute';

import LoginPage from '@/modules/auth/pages/LoginPage';

import RegisterPage from '@/modules/auth/pages/RegisterPage';

import VerifyEmailPage from '@/modules/auth/pages/VerifyEmailPage';


export default function AuthRoutes() {

  return (

    <Fragment>

      <Route
        element={
          <SiteLayout />
        }
      >

        <Route
          element={
            <GuestRoute />
          }
        >

          <Route
            path="login"
            element={
              <LoginPage />
            }
          />


          <Route
            path="register"
            element={
              <RegisterPage />
            }
          />


          <Route
            path="verify-email"
            element={
              <VerifyEmailPage />
            }
          />

        </Route>

      </Route>

    </Fragment>
  );
}