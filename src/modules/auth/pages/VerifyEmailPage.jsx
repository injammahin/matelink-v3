import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  RefreshCw,
} from 'lucide-react';

import {
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/shared/components/ui/button';

import AuthShell from '@/modules/auth/components/AuthShell';

import {
  resendVerificationRequest,
} from '@/modules/auth/api/authApi';


export default function VerifyEmailPage() {

  const location =
    useLocation();


  const email =
    useMemo(
      () =>
        location.state?.email ||
        sessionStorage.getItem(
          'matelink.pending-verification-email'
        ) ||
        '',
      [
        location.state,
      ]
    );


  const [
    sending,
    setSending,
  ] =
    useState(false);


  const [
    countdown,
    setCountdown,
  ] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | RESEND COUNTDOWN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      countdown <= 0
    ) {
      return;
    }


    const timer =
      window.setInterval(
        () => {

          setCountdown(
            (
              current
            ) =>
              Math.max(
                current - 1,
                0
              )
          );

        },
        1000
      );


    return () =>
      window.clearInterval(
        timer
      );

  }, [
    countdown,
  ]);


  /*
  |--------------------------------------------------------------------------
  | EMAIL IS REQUIRED
  |--------------------------------------------------------------------------
  */

  if (!email) {

    return (
      <Navigate
        to="/register"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RESEND VERIFICATION EMAIL
  |--------------------------------------------------------------------------
  */

  async function handleResend() {

    if (
      sending ||
      countdown > 0
    ) {
      return;
    }


    setSending(true);


    try {

      await resendVerificationRequest(
        email
      );


      toast.success(
        'A new verification email has been sent.'
      );


      /*
       * Prevent repeated spam clicking.
       */

      setCountdown(
        60
      );

    } catch (error) {

      toast.error(
        error?.message ||
        'Unable to resend the verification email.'
      );

    } finally {

      setSending(false);
    }
  }


  return (

    <AuthShell
      eyebrow="Verify your email"
      title="Check your inbox."
      description="We’ve sent a verification link to your email address. Open the message and select Verify Now to activate your Matelink account."
    >

      {/* ICON / STATUS */}

      <div className="verify-email-card">

        <div className="verify-email-icon">

          <MailCheck
            size={28}
            strokeWidth={1.8}
          />

        </div>


        <p className="verify-email-label">
          Verification email sent to
        </p>


        <p className="verify-email-address">
          {email}
        </p>


        <div className="verify-email-note">

          <CheckCircle2
            size={16}
          />

          <span>
            After verification you’ll be signed in automatically.
          </span>

        </div>

      </div>


      {/* RESEND */}

      <div className="verify-email-actions">

        <p className="verify-email-help">
          Didn’t receive the email? Check your spam folder or send another one.
        </p>


        <Button
          type="button"
          variant="outline"
          disabled={
            sending ||
            countdown > 0
          }
          onClick={
            handleResend
          }
          className="verify-resend-button"
        >

          <RefreshCw
            size={16}
            className={
              sending
                ? 'animate-spin'
                : ''
            }
          />


          {sending
            ? 'Sending…'
            : countdown > 0
              ? `Resend in ${countdown}s`
              : 'Resend verification email'}

        </Button>

      </div>


      {/* LOGIN */}

      <div className="auth-switch-row">

        <Link
          to="/login"
          className="inline-flex items-center gap-2"
        >

          <ArrowLeft
            size={15}
          />

          Back to sign in

        </Link>

      </div>

    </AuthShell>
  );
}