import {
  useState,
} from 'react';

import {
  ArrowRight,
  Home,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';

import {
  Link,
  Navigate,
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


export default function RegisterPage() {
  const {
    user,
    register,
    authLoading,
  } = useAuth();

  const navigate =
    useNavigate();


  /* =========================================================
     FORM VALUES
     ========================================================= */

  const [
    values,
    setValues,
  ] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
    terms: false,
  });


  /* =========================================================
     ERRORS
     ========================================================= */

  const [
    errors,
    setErrors,
  ] = useState({});


  /* =========================================================
     ALREADY AUTHENTICATED
     ========================================================= */

  if (user) {
    return (
      <Navigate
        to={
          user?.role === 'admin'
            ? '/admin'
            : '/account'
        }
        replace
      />
    );
  }


  /* =========================================================
     UPDATE FIELD
     ========================================================= */

  function updateField(
    field,
    value
  ) {
    setValues(
      (current) => ({
        ...current,

        [field]:
          value,
      })
    );


    setErrors(
      (current) => ({
        ...current,

        [field]:
          '',

        form:
          '',
      })
    );
  }


  /* =========================================================
     FRONTEND VALIDATION
     ========================================================= */

  function validate() {
    const next = {};


    if (
      !values
        .first_name
        .trim()
    ) {
      next.first_name =
        'Enter your first name.';
    }


    if (
      !values
        .last_name
        .trim()
    ) {
      next.last_name =
        'Enter your last name.';
    }


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
      !values.phone.trim()
    ) {
      next.phone =
        'Enter your phone number.';
    }


    if (
      !values.address.trim()
    ) {
      next.address =
        'Enter your address.';
    }


    if (
      values.password.length < 8
    ) {
      next.password =
        'Use at least 8 characters.';
    }


    if (
      values.password !==
      values.password_confirmation
    ) {
      next.password_confirmation =
        'The passwords do not match.';
    }


    if (
      !values.terms
    ) {
      next.terms =
        'Please accept the terms to continue.';
    }


    return next;
  }


  /* =========================================================
     API FIELD ERRORS
     ========================================================= */

  function apiFieldErrors(
    error
  ) {
    const source =
      error?.errors;


    if (
      !source ||
      typeof source !==
        'object'
    ) {
      return {};
    }


    return Object.fromEntries(
      Object.entries(
        source
      ).map(
        ([
          key,
          value,
        ]) => [
          key,

          Array.isArray(
            value
          )
            ? value[0]
            : value,
        ]
      )
    );
  }


  /* =========================================================
     SUBMIT REGISTRATION
     ========================================================= */

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
      /*
      |--------------------------------------------------------------------------
      | CREATE ACCOUNT
      |--------------------------------------------------------------------------
      */

      await register({
        first_name:
          values.first_name,

        last_name:
          values.last_name,

        email:
          values.email,

        phone:
          values.phone,

        address:
          values.address,

        password:
          values.password,

        password_confirmation:
          values.password_confirmation,

        remember: true,
      });


      /*
      |--------------------------------------------------------------------------
      | SAVE EMAIL FOR VERIFICATION PAGE
      |--------------------------------------------------------------------------
      |
      | This lets /verify-email survive a refresh.
      |
      */

      sessionStorage.setItem(
        'matelink.pending-verification-email',
        values.email
          .trim()
          .toLowerCase()
      );


      /*
      |--------------------------------------------------------------------------
      | SUCCESS MESSAGE
      |--------------------------------------------------------------------------
      */

      toast.success(
        'Your Matelink account has been created. Please verify your email.'
      );


      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | DO NOT redirect to /login here.
      |
      | Registration flow:
      |
      | Register
      |     ↓
      | Verify Email page
      |     ↓
      | User opens email
      |     ↓
      | Click Verify Now
      |     ↓
      | Laravel verifies email + generates token
      |     ↓
      | React automatically authenticates
      |
      */

      navigate(
        '/verify-email',
        {
          replace: true,

          state: {
            email:
              values.email
                .trim()
                .toLowerCase(),
          },
        }
      );

    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | API VALIDATION ERRORS
      |--------------------------------------------------------------------------
      */

      const fieldErrors =
        apiFieldErrors(
          error
        );


      setErrors({
        ...fieldErrors,

        form:
          Object.keys(
            fieldErrors
          ).length > 0
            ? ''
            : error
                ?.displayMessage ||
              error?.message ||
              'Unable to create your account. Please try again.',
      });
    }
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <AuthShell
      wide
      eyebrow="Create your account"
      title="A cleaner way to manage your clean."
      description="Set up your Matelink customer account so your contact details and future booking journey stay together."
    >

      {/* ===============================================
          GLOBAL ERROR
      ================================================ */}

      {errors.form && (
        <div
          className="auth-error-message"
          role="alert"
        >
          {errors.form}
        </div>
      )}


      {/* ===============================================
          REGISTER FORM
      ================================================ */}

      <form
        className="auth-form"
        onSubmit={
          handleSubmit
        }
        noValidate
      >

        <div className="auth-register-grid">

          {/* =============================================
              FIRST NAME
          ============================================== */}

          <div>

            <Label
              htmlFor="first-name"
              className="auth-label"
            >
              First name
            </Label>


            <div className="auth-input-wrap">

              <UserRound
                className="auth-input-icon"
                size={17}
              />


              <Input
                id="first-name"
                autoComplete="given-name"
                value={
                  values.first_name
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'first_name',
                    event.target.value
                  )
                }
                placeholder="Jane"
                className="auth-input"
              />

            </div>


            {errors.first_name && (
              <p className="field-error auth-field-error">
                {errors.first_name}
              </p>
            )}

          </div>


          {/* =============================================
              LAST NAME
          ============================================== */}

          <div>

            <Label
              htmlFor="last-name"
              className="auth-label"
            >
              Last name
            </Label>


            <div className="auth-input-wrap">

              <UserRound
                className="auth-input-icon"
                size={17}
              />


              <Input
                id="last-name"
                autoComplete="family-name"
                value={
                  values.last_name
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'last_name',
                    event.target.value
                  )
                }
                placeholder="Doe"
                className="auth-input"
              />

            </div>


            {errors.last_name && (
              <p className="field-error auth-field-error">
                {errors.last_name}
              </p>
            )}

          </div>


          {/* =============================================
              EMAIL
          ============================================== */}

          <div>

            <Label
              htmlFor="register-email"
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
                id="register-email"
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
                    event.target.value
                  )
                }
                placeholder="jane@example.com"
                className="auth-input"
              />

            </div>


            {errors.email && (
              <p className="field-error auth-field-error">
                {errors.email}
              </p>
            )}

          </div>


          {/* =============================================
              PHONE
          ============================================== */}

          <div>

            <Label
              htmlFor="register-phone"
              className="auth-label"
            >
              Phone number
            </Label>


            <div className="auth-input-wrap">

              <Phone
                className="auth-input-icon"
                size={17}
              />


              <Input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={
                  values.phone
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'phone',
                    event.target.value
                  )
                }
                placeholder="04xx xxx xxx"
                className="auth-input"
              />

            </div>


            {errors.phone && (
              <p className="field-error auth-field-error">
                {errors.phone}
              </p>
            )}

          </div>


          {/* =============================================
              ADDRESS
          ============================================== */}

          <div className="auth-register-full">

            <Label
              htmlFor="register-address"
              className="auth-label"
            >
              Address
            </Label>


            <div className="auth-input-wrap">

              <Home
                className="auth-input-icon"
                size={17}
              />


              <Input
                id="register-address"
                autoComplete="street-address"
                value={
                  values.address
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'address',
                    event.target.value
                  )
                }
                placeholder="Your street address"
                className="auth-input"
              />

            </div>


            {errors.address && (
              <p className="field-error auth-field-error">
                {errors.address}
              </p>
            )}

          </div>


          {/* =============================================
              PASSWORD
          ============================================== */}

          <PasswordField
            id="register-password"
            label="Password"
            value={
              values.password
            }
            onChange={(
              event
            ) =>
              updateField(
                'password',
                event.target.value
              )
            }
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            error={
              errors.password
            }
          />


          {/* =============================================
              CONFIRM PASSWORD
          ============================================== */}

          <PasswordField
            id="register-password-confirmation"
            label="Confirm password"
            value={
              values.password_confirmation
            }
            onChange={(
              event
            ) =>
              updateField(
                'password_confirmation',
                event.target.value
              )
            }
            autoComplete="new-password"
            placeholder="Enter your password again"
            error={
              errors.password_confirmation
            }
          />

        </div>


        {/* ===============================================
            TERMS
        ================================================ */}

        <div>

          <label className="auth-terms-row">

            <input
              type="checkbox"
              checked={
                values.terms
              }
              onChange={(
                event
              ) =>
                updateField(
                  'terms',
                  event.target.checked
                )
              }
            />


            <span>
              I agree to Matelink’s{' '}

              <Link to="/terms">
                Terms & Conditions
              </Link>

              {' '}and{' '}

              <Link to="/privacy">
                Privacy Policy
              </Link>
              .
            </span>

          </label>


          {errors.terms && (
            <p className="field-error auth-field-error">
              {errors.terms}
            </p>
          )}

        </div>


        {/* ===============================================
            SUBMIT
        ================================================ */}

        <Button
          type="submit"
          disabled={
            authLoading
          }
          className="auth-submit-button"
        >

          {authLoading
            ? 'Creating account…'
            : 'Create account'}


          {!authLoading && (
            <ArrowRight
              size={17}
            />
          )}

        </Button>

      </form>


      {/* ===============================================
          EXISTING ACCOUNT
      ================================================ */}

      <div className="auth-switch-row">

        <span>
          Already have an account?
        </span>

        <Link to="/login">
          Sign in
        </Link>

      </div>

    </AuthShell>
  );
}