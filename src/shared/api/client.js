const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/+$/, '');

const TOKEN_LOCAL_KEY =
  'matelink.auth.token';

const TOKEN_SESSION_KEY =
  'matelink.auth.session-token';


/* =========================================================
   API ERROR
   ========================================================= */

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      errors = null,
      data = null,
    } = {}
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}


/* =========================================================
   TOKEN
   ========================================================= */

export function getAuthToken() {
  return (
    localStorage.getItem(
      TOKEN_LOCAL_KEY
    ) ||
    sessionStorage.getItem(
      TOKEN_SESSION_KEY
    ) ||
    ''
  );
}


export function storeAuthToken(
  token,
  remember = true
) {
  localStorage.removeItem(
    TOKEN_LOCAL_KEY
  );

  sessionStorage.removeItem(
    TOKEN_SESSION_KEY
  );

  if (!token) {
    return;
  }

  if (remember) {
    localStorage.setItem(
      TOKEN_LOCAL_KEY,
      token
    );
  } else {
    sessionStorage.setItem(
      TOKEN_SESSION_KEY,
      token
    );
  }
}


export function clearAuthToken() {
  localStorage.removeItem(
    TOKEN_LOCAL_KEY
  );

  sessionStorage.removeItem(
    TOKEN_SESSION_KEY
  );
}


/* =========================================================
   URL
   ========================================================= */

function buildUrl(path) {
  if (!API_BASE_URL) {
    throw new ApiError(
      'API URL is not configured. Add VITE_API_BASE_URL to your environment file.'
    );
  }

  return `${API_BASE_URL}/${String(
    path
  ).replace(/^\/+/, '')}`;
}


/* =========================================================
   ERROR HELPERS
   ========================================================= */

function validationErrors(
  payload
) {
  return (
    payload?.errors ||
    payload?.data?.errors ||
    payload?.error?.errors ||
    null
  );
}


function responseMessage(
  payload,
  fallback
) {
  return (
    payload?.message ||
    payload?.error?.message ||
    payload?.data?.message ||
    fallback
  );
}


/* =========================================================
   API REQUEST
   ========================================================= */

export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    token: tokenOverride,
    signal,
  } = {}
) {
  const token =
    tokenOverride ??
    getAuthToken();

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };


  if (
    body !== undefined &&
    !(body instanceof FormData)
  ) {
    requestHeaders[
      'Content-Type'
    ] = 'application/json';
  }


  if (
    auth &&
    token
  ) {
    requestHeaders.Authorization =
      `Bearer ${token}`;
  }


  let response;

  try {
    response = await fetch(
    buildUrl(path),
    {
        method,
        headers: requestHeaders,

        body:
        body === undefined
            ? undefined
            : body instanceof FormData
            ? body
            : JSON.stringify(body),

        signal,
    }
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error;
    }

    throw new ApiError(
      'Unable to connect to the Matelink server. Check the API URL, network and CORS settings.',
      {
        data: error,
      }
    );
  }


  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  let payload = null;


  if (
    response.status !== 204
  ) {
    try {
      payload =
        contentType.includes(
          'application/json'
        )
          ? await response.json()
          : await response.text();
    } catch {
      payload = null;
    }
  }


  if (!response.ok) {
    const fallback =
      response.status === 401
        ? 'The email or password is incorrect.'
        : response.status === 422
          ? 'Please check the information you entered.'
          : 'Something went wrong. Please try again.';


    throw new ApiError(
      responseMessage(
        payload,
        fallback
      ),
      {
        status:
          response.status,

        errors:
          validationErrors(
            payload
          ),

        data:
          payload,
      }
    );
  }


  return payload;
}