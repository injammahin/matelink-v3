import {
  apiRequest,
} from '@/shared/api/client';


const AUTH_PREFIX =
  '/v1/auth';


export function loginRequest({
  username,
  password,
}) {
  return apiRequest(
    `${AUTH_PREFIX}/login`,
    {
      method: 'POST',

      auth: false,

      body: {
        username,
        password,
      },
    }
  );
}


export function registerRequest(
  payload
) {
  return apiRequest(
    `${AUTH_PREFIX}/register`,
    {
      method: 'POST',

      auth: false,

      body: payload,
    }
  );
}


export function logoutRequest(
  token
) {
  return apiRequest(
    `${AUTH_PREFIX}/logout`,
    {
      method: 'POST',

      auth: true,

      token,
    }
  );
}


/* =========================================================
   RESEND VERIFICATION EMAIL
   ========================================================= */

export function resendVerificationRequest(
  email
) {
  return apiRequest(
    `${AUTH_PREFIX}/email/resend`,
    {
      method: 'POST',

      auth: false,

      body: {
        email,
      },
    }
  );
}


/* =========================================================
   CURRENT AUTHENTICATED USER
   ========================================================= */

/*
 * If your actual authenticated-user endpoint has
 * a different path, change ONLY this endpoint.
 */

export function getCurrentUserRequest(
  token
) {
  return apiRequest(
    `${AUTH_PREFIX}/me`,
    {
      method: 'GET',

      auth: true,

      token,
    }
  );
}