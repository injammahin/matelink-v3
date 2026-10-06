import {
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
  Mail,
} from 'lucide-react';

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/shared/components/ui/button';

import {
  Input,
} from '@/shared/components/ui/input';

import {
  Label,
} from '@/shared/components/ui/label';

import AuthShell from '@/modules/auth/components/AuthShell';

import PasswordField from '@/modules/auth/components/PasswordField';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';


export default function LoginPage() {
  const {
    user,
    login,
    authLoading,
  } =
    useAuth();


  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    values,
    setValues,
  ] =
    useState({
      email:
        location.state?.email ||
        '',

      password: '',

      remember: true,
    });


  const [
    errors,
    setErrors,
  ] =
    useState({});


  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  function updateField(
    field,
    value
  ) {
    setValues(
      (
        current
      ) => ({
        ...current,

        [field]:
          value,
      })
    );


    setErrors(
      (
        current
      ) => ({
        ...current,

        [field]:
          '',

        form:
          '',
      })
    );
  }


  function validate() {
    const next = {};


    if (
      !values.email.trim()
    ) {
      next.email =
        'Enter your email address.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email.trim()
      )
    ) {
      next.email =
        'Enter a valid email address.';
    }


    if (
      !values.password
    ) {
      next.password =
        'Enter your password.';
    }


    return next;
  }


async function handleSubmit(
  event
) {
  event.preventDefault();


  const nextErrors =
    validate();


  if (
    Object.keys(
      nextErrors
    ).length
  ) {
    setErrors(
      nextErrors
    );

    return;
  }


  try {

    const result =
      await login({

        email:
          values.email,

        password:
          values.password,

        remember:
          values.remember,
      });


    const loggedInUser =
      result.user;


    const firstName =
      loggedInUser
        ?.first_name ||
      loggedInUser
        ?.name
        ?.split(' ')[0] ||
      'there';


    toast.success(
      `Welcome back, ${firstName}.`
    );


    /* =====================================================
       ADMIN
       ===================================================== */

    if (
      loggedInUser
        ?.role ===
      'admin'
    ) {

      navigate(
        '/admin',
        {
          replace: true,
        }
      );

      return;
    }


    /* =====================================================
       CUSTOMER
       ===================================================== */

    const requestedRoute =
      location.state
        ?.from;


    /*
     * Never allow a normal customer
     * to redirect into /admin.
     */

    const destination =
      requestedRoute &&
      !requestedRoute.startsWith(
        '/admin'
      )
        ? requestedRoute
        : '/account';


    navigate(
      destination,
      {
        replace: true,
      }
    );

  } catch (error) {

    setErrors({

      form:
        error
          ?.displayMessage ||
        error?.message ||
        'Unable to sign in. Please try again.',

    });
  }
}


  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Matelink."
      description="Access your account, booking details and cleaning requests in one place."
    >

      {location.state
        ?.registered && (

        <div
          className="auth-success-message"
          role="status"
        >

          <CheckCircle2
            size={17}
          />

          Your account was created. Sign in to continue.

        </div>

      )}


      {errors.form && (

        <div
          className="auth-error-message"
          role="alert"
        >
          {errors.form}
        </div>

      )}


      <form
        className="auth-form"
        onSubmit={
          handleSubmit
        }
        noValidate
      >

        <div>

          <Label
            htmlFor="login-email"
            className="auth-label"
          >
            Email address
          </Label>


          <div className="auth-input-wrap">

            <Mail
              className="auth-input-icon"
              size={17}
            />


            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={
                values.email
              }
              onChange={(
                event
              ) =>
                updateField(
                  'email',
                  event.target
                    .value
                )
              }
              placeholder="you@example.com"
              aria-invalid={
                Boolean(
                  errors.email
                )
              }
              className="auth-input"
            />

          </div>


          {errors.email && (

            <p className="field-error auth-field-error">
              {errors.email}
            </p>

          )}

        </div>


        <PasswordField
          id="login-password"
          label="Password"
          value={
            values.password
          }
          onChange={(
            event
          ) =>
            updateField(
              'password',
              event.target
                .value
            )
          }
          autoComplete="current-password"
          error={
            errors.password
          }
        />


        <div className="auth-form-options">

          <label className="auth-remember">

            <input
              type="checkbox"
              checked={
                values.remember
              }
              onChange={(
                event
              ) =>
                updateField(
                  'remember',
                  event.target
                    .checked
                )
              }
            />

            <span>
              Keep me signed in
            </span>

          </label>


          <span className="auth-form-hint">
            Secure account access
          </span>

        </div>


        <Button
          type="submit"
          disabled={
            authLoading
          }
          className="auth-submit-button"
        >

          {authLoading
            ? 'Signing in…'
            : 'Sign in'}


          {!authLoading && (
            <ArrowRight
              size={17}
            />
          )}

        </Button>

      </form>


      <div className="auth-switch-row">

        <span>
          New to Matelink?
        </span>

        <Link to="/register">
          Create an account
        </Link>

      </div>


      <p className="auth-legal">

        By signing in, you agree to Matelink’s{' '}

        <Link to="/terms">
          Terms
        </Link>

        {' '}and{' '}

        <Link to="/privacy">
          Privacy Policy
        </Link>
        .

      </p>

    </AuthShell>
  );
}