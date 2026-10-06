import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  clearAuthToken,
  getAuthToken,
  storeAuthToken,
} from '@/shared/api/client';

import {
  loginRequest,
  logoutRequest,
  registerRequest,
  getCurrentUserRequest,
} from '@/modules/auth/api/authApi';


const AuthContext =
  createContext(null);


const USER_LOCAL_KEY =
  'matelink.auth.user';

const USER_SESSION_KEY =
  'matelink.auth.session-user';


/* =========================================================
   STORAGE
   ========================================================= */

function readJson(
  storage,
  key
) {
  try {
    const value =
      storage.getItem(key);

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    return null;
  }
}


function loadStoredUser() {
  return (
    readJson(
      localStorage,
      USER_LOCAL_KEY
    ) ||
    readJson(
      sessionStorage,
      USER_SESSION_KEY
    )
  );
}


function clearStoredUser() {
  localStorage.removeItem(
    USER_LOCAL_KEY
  );

  sessionStorage.removeItem(
    USER_SESSION_KEY
  );
}


function storeUser(
  user,
  remember = true
) {
  clearStoredUser();

  if (!user) {
    return;
  }


  const storage =
    remember
      ? localStorage
      : sessionStorage;


  const key =
    remember
      ? USER_LOCAL_KEY
      : USER_SESSION_KEY;


  storage.setItem(
    key,
    JSON.stringify(user)
  );
}


/* =========================================================
   RESPONSE HELPERS
   ========================================================= */

/*
|--------------------------------------------------------------------------
| Your API response:
|--------------------------------------------------------------------------
|
| {
|   "message": "Login successful.",
|   "data": {
|     "token": "...",
|     "token_type": "Bearer",
|     "user": {...},
|     "redirect_url": "http://localhost:4173/admin"
|   }
| }
|
*/

function pickToken(
  response
) {
  return (
    response?.data?.token ||
    response?.token ||
    response?.access_token ||
    response?.data?.access_token ||
    ''
  );
}


function pickUser(
  response
) {
  return (
    response?.data?.user ||
    response?.user ||
    null
  );
}


function pickRedirectUrl(
  response
) {
  return (
    response?.data
      ?.redirect_url ||
    response?.redirect_url ||
    ''
  );
}


/* =========================================================
   NORMALIZE USER
   ========================================================= */

function normaliseUser(
  rawUser,
  fallback = {}
) {
  const raw =
    rawUser || {};


  const firstName =
    raw.first_name ||
    raw.firstName ||
    fallback.first_name ||
    fallback.firstName ||
    '';


  const lastName =
    raw.last_name ||
    raw.lastName ||
    fallback.last_name ||
    fallback.lastName ||
    '';


  const email =
    raw.email ||
    raw.username ||
    fallback.email ||
    fallback.username ||
    '';


  const fullName =
    raw.name ||
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    (
      email
        ? email.split('@')[0]
        : 'Customer'
    );


  return {
    ...raw,

    id:
      raw.id ??
      raw.user_id ??
      null,

    first_name:
      firstName,

    last_name:
      lastName,

    name:
      fullName,

    username:
      raw.username ||
      email,

    email,

    phone:
      raw.phone ||
      fallback.phone ||
      '',

    address:
      raw.address ||
      fallback.address ||
      '',

    role:
      String(
        raw.role ||
        raw.user_type ||
        raw.type ||
        fallback.role ||
        'customer'
      ).toLowerCase(),

    is_system:
      Boolean(
        raw.is_system
      ),

    email_verified_at:
      raw.email_verified_at ||
      null,
  };
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function firstValidationMessage(
  error
) {
  const errors =
    error?.errors;


  if (
    !errors ||
    typeof errors !==
      'object'
  ) {
    return (
      error?.message ||
      'Something went wrong.'
    );
  }


  const first =
    Object.values(
      errors
    )[0];


  if (
    Array.isArray(first)
  ) {
    return (
      first[0] ||
      error.message
    );
  }


  if (
    typeof first ===
    'string'
  ) {
    return first;
  }


  return (
    error?.message ||
    'Please check your information.'
  );
}


/* =========================================================
   PROVIDER
   ========================================================= */

export function AuthProvider({
  children,
}) {

  const [
    user,
    setUser,
  ] =
    useState(
      loadStoredUser
    );


  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(false);


  /* =======================================================
     LOGIN
     ======================================================= */

  async function login({
    email,
    username,
    password,
    remember = true,
  }) {

    setAuthLoading(true);


    try {

      const loginName =
        (
          username ||
          email ||
          ''
        ).trim();


      const response =
        await loginRequest({
          username:
            loginName,

          password,
        });


      const token =
        pickToken(
          response
        );


      const rawUser =
        pickUser(
          response
        );


      if (!token) {
        throw new Error(
          'Login succeeded but no authentication token was returned.'
        );
      }


      if (!rawUser) {
        throw new Error(
          'Login succeeded but user information was not returned.'
        );
      }


      const nextUser =
        normaliseUser(
          rawUser,
          {
            email:
              loginName,
          }
        );


      /*
       * Save Bearer token.
       */

      storeAuthToken(
        token,
        remember
      );


      /*
       * Save authenticated user.
       */

      storeUser(
        nextUser,
        remember
      );


      setUser(
        nextUser
      );


      /*
       * Return additional API info.
       */

      return {
        user:
          nextUser,

        token,

        redirectUrl:
          pickRedirectUrl(
            response
          ),

        response,
      };

    } catch (error) {

      clearAuthToken();

      clearStoredUser();

      setUser(null);


      error.displayMessage =
        firstValidationMessage(
          error
        );


      throw error;

    } finally {

      setAuthLoading(false);
    }
  }


  /* =======================================================
     REGISTER
     ======================================================= */

  async function register({
    first_name,
    last_name,
    email,
    phone,
    address,
    password,
    password_confirmation,
    remember = true,
  }) {

    setAuthLoading(true);


    const payload = {

      first_name:
        first_name.trim(),

      last_name:
        last_name.trim(),

      email:
        email
          .trim()
          .toLowerCase(),

      phone:
        phone.trim(),

      address:
        address.trim(),

      password,

      password_confirmation,
    };


    try {

      const response =
        await registerRequest(
          payload
        );


      const token =
        pickToken(
          response
        );


      const rawUser =
        pickUser(
          response
        );


      const nextUser =
        rawUser
          ? normaliseUser(
              rawUser,
              payload
            )
          : null;


      /*
       * Some APIs automatically
       * authenticate on register.
       */

      if (
        token &&
        nextUser
      ) {

        storeAuthToken(
          token,
          remember
        );


        storeUser(
          nextUser,
          remember
        );


        setUser(
          nextUser
        );
      }


      return {

        user:
          nextUser,

        token,

        authenticated:
          Boolean(
            token &&
            nextUser
          ),

        redirectUrl:
          pickRedirectUrl(
            response
          ),

        response,
      };

    } catch (error) {

      error.displayMessage =
        firstValidationMessage(
          error
        );


      throw error;

    } finally {

      setAuthLoading(false);
    }
  }


  /* =======================================================
     VERIFIED LOGIN
     ======================================================= */

async function completeVerifiedLogin({
  token,
}) {

  if (!token) {

    throw new Error(
      'Verification token is missing.'
    );
  }


  /*
  |--------------------------------------------------------------------------
  | STORE TOKEN
  |--------------------------------------------------------------------------
  */

  storeAuthToken(
    token,
    true
  );


  try {

    /*
    |--------------------------------------------------------------------------
    | GET AUTHENTICATED USER
    |--------------------------------------------------------------------------
    */

    const response =
      await getCurrentUserRequest(
        token
      );


    /*
     * Support:
     *
     * {
     *   data: {
     *     user: {...}
     *   }
     * }
     *
     * or
     *
     * {
     *   data: {...}
     * }
     */

    const rawUser =
      response?.data?.user ||
      response?.user ||
      response?.data ||
      null;


    if (!rawUser) {

      throw new Error(
        'Authenticated user information was not returned.'
      );
    }


    const nextUser =
      normaliseUser(
        rawUser
      );


    /*
    |--------------------------------------------------------------------------
    | SAVE AUTHENTICATED USER
    |--------------------------------------------------------------------------
    */

    storeUser(
      nextUser,
      true
    );


    setUser(
      nextUser
    );


    return nextUser;

  } catch (error) {

    clearAuthToken();

    clearStoredUser();

    setUser(null);


    throw error;
  }
}


  /* =======================================================
     LOGOUT
     ======================================================= */

  async function logout() {

    const token =
      getAuthToken();


    /*
     * Clear frontend immediately.
     */

    setUser(null);

    clearStoredUser();


    try {

      if (token) {
        await logoutRequest(
          token
        );
      }

    } catch (error) {

      console.warn(
        'Logout API failed:',
        error
      );

    } finally {

      clearAuthToken();
    }
  }


  /* =======================================================
     UPDATE USER
     ======================================================= */

  function updateUser(
    values
  ) {

    if (!user) {
      return null;
    }


    const nextUser =
      normaliseUser(
        {
          ...user,
          ...values,
        },
        user
      );


    const remembered =
      Boolean(
        localStorage.getItem(
          'matelink.auth.user'
        )
      );


    storeUser(
      nextUser,
      remembered
    );


    setUser(
      nextUser
    );


    return nextUser;
  }


  /* =======================================================
     HELPERS
     ======================================================= */

  const isAuthenticated =
    Boolean(
      user &&
      getAuthToken()
    );


  const isAdmin =
    Boolean(
      isAuthenticated &&
      user?.role ===
        'admin'
    );


  /* =======================================================
     CONTEXT
     ======================================================= */

  const value =
    useMemo(
      () => ({

        user,

        authLoading,

        isAuthenticated,

        isAdmin,

        login,

        register,

        logout,

        updateUser,

        completeVerifiedLogin,

      }),
      [
        user,
        authLoading,
        isAuthenticated,
        isAdmin,
      ]
    );


  return (

    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* =========================================================
   HOOK
   ========================================================= */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      'useAuth must be used inside AuthProvider.'
    );
  }


  return context;
}