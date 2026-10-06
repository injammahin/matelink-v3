import {
  useEffect,
} from 'react';

import {
  Routes,
  useLocation,
} from 'react-router-dom';

import {
  Toaster,
} from 'sonner';


import PublicRoutes from './routes/PublicRoutes';

import AuthRoutes from './routes/AuthRoutes';

import CustomerRoutes from './routes/CustomerRoutes';

import AdminRoutes from './routes/AdminRoutes';


import VerificationRedirectHandler from '@/modules/auth/components/VerificationRedirectHandler';


import {
  pageMetadata,
  services,
} from '@/shared/data/content';


/* =========================================================
   ROUTE EFFECTS
   ========================================================= */

function RouteEffects() {
  const {
    pathname,
  } = useLocation();


  useEffect(() => {
    /* ---------------------------------------------------------
       SCROLL PAGE TO TOP
    --------------------------------------------------------- */

    window.scrollTo({
      top: 0,

      left: 0,

      behavior: 'instant',
    });


    /* ---------------------------------------------------------
       SERVICE PAGE
    --------------------------------------------------------- */

    const service =
      services.find(
        (item) =>
          `/${item.slug}` ===
          pathname
      );


    /* ---------------------------------------------------------
       AUTH PAGE META
    --------------------------------------------------------- */

    const authMetadata = {
      '/login': [
        'Sign in',

        'Sign in to your Matelink Cleaning account.',
      ],


      '/register': [
        'Create account',

        'Create your Matelink Cleaning customer account.',
      ],
    };


    /* ---------------------------------------------------------
       RESOLVE META
    --------------------------------------------------------- */

    let title;

    let description;


    if (service) {
      title =
        `${service.name} in Sydney`;

      description =
        service.summary;
    } else if (
      authMetadata[pathname]
    ) {
      [
        title,
        description,
      ] =
        authMetadata[
          pathname
        ];
    } else if (
      pageMetadata[pathname]
    ) {
      [
        title,
        description,
      ] =
        pageMetadata[
          pathname
        ];
    } else if (
      pathname.startsWith(
        '/admin'
      )
    ) {
      title =
        'Admin workspace';

      description =
        'Manage Matelink Cleaning bookings, customers, pricing and settings.';
    } else if (
      pathname.startsWith(
        '/account'
      )
    ) {
      title =
        'My account';

      description =
        'Manage your Matelink Cleaning account and booking details.';
    } else if (
      pathname.startsWith(
        '/booking/'
      )
    ) {
      title =
        'Your booking';

      description =
        'View your Matelink Cleaning booking details and next steps.';
    } else {
      title =
        'Matelink Cleaning';

      description =
        'Professional home cleaning services in Sydney.';
    }


    /* ---------------------------------------------------------
       PAGE TITLE
    --------------------------------------------------------- */

    document.title =
      `${title} | Matelink Cleaning`;


    /* ---------------------------------------------------------
       META DESCRIPTION
    --------------------------------------------------------- */

    let meta =
      document.querySelector(
        'meta[name="description"]'
      );


    /*
     * Create description tag if
     * index.html doesn't already
     * contain one.
     */

    if (!meta) {
      meta =
        document.createElement(
          'meta'
        );


      meta.setAttribute(
        'name',
        'description'
      );


      document.head.appendChild(
        meta
      );
    }


    meta.setAttribute(
      'content',
      description
    );
  }, [
    pathname,
  ]);


  return null;
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {
  return (
    <>
      {/* =====================================================
          GLOBAL ROUTE EFFECTS
      ====================================================== */}

      <RouteEffects />


      {/* =====================================================
          EMAIL VERIFICATION / AUTH REDIRECT HANDLER
      ====================================================== */}

      <VerificationRedirectHandler />


      {/* =====================================================
          APPLICATION ROUTES
      ====================================================== */}

      <Routes>

        {/* PUBLIC WEBSITE */}

        {PublicRoutes()}


        {/* LOGIN / REGISTER */}

        {AuthRoutes()}


        {/* CUSTOMER ACCOUNT */}

        {CustomerRoutes()}


        {/* ADMIN */}

        {AdminRoutes()}

      </Routes>


      {/* =====================================================
          GLOBAL TOASTS
      ====================================================== */}

      <Toaster
        position="bottom-right"

        theme="light"

        richColors

        closeButton

        toastOptions={{
          style: {
            fontFamily:
              'Manrope, sans-serif',
          },
        }}
      />
    </>
  );
}