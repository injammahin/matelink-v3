import {
  useEffect,
  useRef,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  toast,
} from 'sonner';

import {
  useAuth,
} from '@/modules/auth/context/AuthContext';


export default function VerificationRedirectHandler() {

  const location =
    useLocation();


  const navigate =
    useNavigate();


  const handled =
    useRef(false);


  const {
    user,
    completeVerifiedLogin,
  } =
    useAuth();


  useEffect(() => {

    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE PROCESSING
    |--------------------------------------------------------------------------
    */

    if (
      handled.current
    ) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | QUERY STRING
    |--------------------------------------------------------------------------
    |
    | ?verified=1
    |
    */

    const queryParams =
      new URLSearchParams(
        location.search
      );


    const verified =
      queryParams.get(
        'verified'
      );


    if (
      verified !== '1'
    ) {
      return;
    }


    handled.current =
      true;


    /*
    |--------------------------------------------------------------------------
    | URL FRAGMENT
    |--------------------------------------------------------------------------
    |
    | Laravel sends:
    |
    | #token=xxxxx&token_type=Bearer
    |
    */

    const hashValue =
      location.hash.startsWith(
        '#'
      )
        ? location.hash.slice(1)
        : location.hash;


    const hashParams =
      new URLSearchParams(
        hashValue
      );


    const token =
      hashParams.get(
        'token'
      );


    /*
    |--------------------------------------------------------------------------
    | ALREADY AUTHENTICATED
    |--------------------------------------------------------------------------
    */

    if (user) {

      sessionStorage.removeItem(
        'matelink.pending-verification-email'
      );


      toast.success(
        'Your email has been verified.'
      );


      const destination =
        user?.role === 'admin'
          ? '/admin'
          : '/account';


      navigate(
        destination,
        {
          replace: true,
        }
      );


      return;
    }


    /*
    |--------------------------------------------------------------------------
    | VERIFICATION SUCCESSFUL BUT NO TOKEN
    |--------------------------------------------------------------------------
    |
    | This happens if:
    |
    | - verification link was opened again
    | - backend did not issue token
    | - old verification redirect is being used
    |
    */

    if (!token) {

      console.warn(
        'Verification succeeded but the redirect did not contain an authentication token.'
      );


      toast.success(
        'Your email has been verified. Please sign in.'
      );


      navigate(
        '/login?verified=1',
        {
          replace: true,
        }
      );


      return;
    }


    /*
    |--------------------------------------------------------------------------
    | AUTO LOGIN
    |--------------------------------------------------------------------------
    */

    async function authenticate() {

      try {

        const authenticatedUser =
          await completeVerifiedLogin({
            token,
          });


        sessionStorage.removeItem(
          'matelink.pending-verification-email'
        );


        toast.success(
          'Your email has been verified. Welcome to Matelink.'
        );


        /*
        |--------------------------------------------------------------------------
        | ROLE BASED REDIRECT
        |--------------------------------------------------------------------------
        */

        const destination =
          authenticatedUser
            ?.role ===
          'admin'
            ? '/admin'
            : '/account';


        /*
         * replace removes:
         *
         * ?verified=1
         * #token=...
         *
         * from browser history.
         */

        navigate(
          destination,
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          'Automatic verification login failed:',
          error
        );


        toast.error(
          'Your email was verified, but automatic sign-in failed.'
        );


        navigate(
          '/login?verified=1',
          {
            replace: true,
          }
        );
      }
    }


    authenticate();

  }, [
    location.search,
    location.hash,
    navigate,
    user,
    completeVerifiedLogin,
  ]);


  return null;
}