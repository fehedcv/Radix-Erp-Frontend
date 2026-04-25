const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const RESOURCE_TABLE_MAP = {
  'Business Unit': 'business_units',
  Lead: 'leads',
  User: 'profiles',
  'Agent Credit Ledger': 'agent_credit_ledger',
};

const AUTH_WHITELIST = ['mobile_login', 'agent_signup', 'update_agent_profile'];
const ACCESS_TOKEN_KEY = 'sb_access_token';
const REFRESH_TOKEN_KEY = 'sb_refresh_token';

const toAxiosLikeResponse = (payload) => ({ data: payload });

const makeAxiosError = (message, status = 400, extra = {}) => {
  const error = new Error(message);
  error.response = { status, data: { message, ...extra } };
  return error;
};

const safeJsonParse = (value, fallback) => {
  if (typeof value !== 'string') return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapFrappeFieldToColumn = (field) => {
  if (!field) return field;
  if (field === 'name') return 'id';
  if (field === 'creation') return 'created_at';
  return field;
};

const getTableFromResourcePath = (url) => {
  const cleaned = url.replace(/^\/resource\//, '');
  const [rawResource] = cleaned.split('/');
  const resourceName = decodeURIComponent(rawResource);
  return RESOURCE_TABLE_MAP[resourceName] || resourceName.toLowerCase().replace(/\s+/g, '_');
};

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

const getAuthHeaders = (authRequired = true) => {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };

  const token = getAccessToken();
  if (authRequired && token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const mapFiltersToQueryParams = (searchParams, rawFilters) => {
  const filters = safeJsonParse(rawFilters, []);
  if (!Array.isArray(filters)) return;

  filters.forEach((filter) => {
    if (!Array.isArray(filter) || filter.length < 3) return;
    const [field, op, value] = filter;
    const column = mapFrappeFieldToColumn(field);

    switch (op) {
      case '=':
        searchParams.append(column, `eq.${value}`);
        break;
      case '!=':
        searchParams.append(column, `neq.${value}`);
        break;
      case 'in':
        if (Array.isArray(value)) {
          searchParams.append(column, `in.(${value.map((v) => `"${v}"`).join(',')})`);
        }
        break;
      case 'like':
        searchParams.append(column, `ilike.${value}`);
        break;
      case '>':
        searchParams.append(column, `gt.${value}`);
        break;
      case '<':
        searchParams.append(column, `lt.${value}`);
        break;
      default:
        break;
    }
  });
};

const normalizeRow = (row) => {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  if (normalized.id && !normalized.name) normalized.name = normalized.id;
  if (normalized.created_at && !normalized.creation) normalized.creation = normalized.created_at;
  return normalized;
};

const handleSupabaseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.msg || payload?.message || payload?.error_description || 'Request failed';
    throw makeAxiosError(message, response.status, typeof payload === 'object' ? payload : { payload });
  }

  return payload;
};

const listResource = async (url, params = {}) => {
  const table = getTableFromResourcePath(url);
  const fields = safeJsonParse(params.fields, ['*']);
  const limit = Number(params.limit_page_length ?? 20);

  const searchParams = new URLSearchParams();
  if (Array.isArray(fields)) {
    searchParams.set('select', fields.map(mapFrappeFieldToColumn).join(','));
  } else {
    searchParams.set('select', '*');
  }

  mapFiltersToQueryParams(searchParams, params.filters);

  if (params.order_by) {
    const [field, direction = 'asc'] = String(params.order_by).split(/\s+/);
    searchParams.set('order', `${mapFrappeFieldToColumn(field)}.${direction.toLowerCase()}`);
  }

  if (limit > 0) searchParams.set('limit', String(limit));

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${searchParams.toString()}`, {
    headers: getAuthHeaders(true),
  });

  const data = await handleSupabaseResponse(response);
  return toAxiosLikeResponse({ data: (data || []).map(normalizeRow) });
};

const getResourceById = async (url) => {
  const cleaned = url.replace(/^\/resource\//, '');
  const [rawResource, ...rawIdParts] = cleaned.split('/');
  const resourceName = decodeURIComponent(rawResource);
  const id = decodeURIComponent(rawIdParts.join('/'));
  const table = RESOURCE_TABLE_MAP[resourceName] || resourceName.toLowerCase().replace(/\s+/g, '_');

  const searchParams = new URLSearchParams({ select: '*' });
  searchParams.set('id', `eq.${id}`);
  searchParams.set('limit', '1');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${searchParams.toString()}`, {
    headers: getAuthHeaders(true),
  });

  const data = await handleSupabaseResponse(response);
  return toAxiosLikeResponse({ data: normalizeRow(data?.[0] || {}) });
};

const uploadToStorage = async (formData) => {
  const file = formData?.get?.('file');
  if (!file) throw makeAxiosError('No file provided', 400);

  const filePath = `${Date.now()}-${file.name}`;
  const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${filePath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${getAccessToken()}`,
      'x-upsert': 'true',
    },
    body: file,
  });

  await handleSupabaseResponse(uploadResponse);

  return toAxiosLikeResponse({
    message: {
      file_url: `${SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`,
    },
  });
};

const invokeMethod = async (url, payload = {}, method = 'POST') => {
  const legacyName = url.replace(/^\/method\//, '');
  const functionName = legacyName.replace(/\./g, '_');

  if (legacyName === 'business_chain.api.auth.mobile_login') {
    const { email, password } = payload;
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleSupabaseResponse(response);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token || '');
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token || '');

    return toAxiosLikeResponse({ message: { api_key: data.access_token, api_secret: data.refresh_token } });
  }

  if (legacyName === 'business_chain.api.auth.agent_signup') {
    const { email, password, full_name, phone } = payload;
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify({
        email,
        password,
        data: { full_name, phone, primary_role: 'agent' },
      }),
    });

    const data = await handleSupabaseResponse(response);
    return toAxiosLikeResponse({ message: { success: true, user: data?.user?.email } });
  }

  if (legacyName === 'business_chain.api.api.whoami') {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const user = await handleSupabaseResponse(authResponse);

    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=primary_role,roles&id=eq.${user.id}&limit=1`,
      { headers: getAuthHeaders(true) }
    );
    const profileRows = await handleSupabaseResponse(profileResponse);
    const profile = profileRows?.[0] || {};

    const primaryRole = profile.primary_role || user.user_metadata?.primary_role || null;
    const roles = profile.roles || (primaryRole ? [primaryRole] : []);

    return toAxiosLikeResponse({ message: { user: user.email, primary_role: primaryRole, roles } });
  }

  if (legacyName === 'upload_file' || legacyName.endsWith('upload_profile_picture') || legacyName.endsWith('upload_business_unit_logo')) {
    return uploadToStorage(payload);
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ method, ...payload }),
  });

  const data = await handleSupabaseResponse(response);
  return toAxiosLikeResponse({ message: data?.message ?? data ?? {} });
};

const ensureAuthorized = async (url) => {
  const isWhitelisted = AUTH_WHITELIST.some((key) => url.includes(key));
  if (isWhitelisted) return;

  const token = getAccessToken();
  if (!token) {
    localStorage.removeItem('bc_api_key');
    localStorage.removeItem('bc_api_secret');
    localStorage.removeItem('vynx_user');
    window.location.href = '/auth';
    throw makeAxiosError('Session expired', 401);
  }
};

const frappeApi = {
  async get(url, config = {}) {
    await ensureAuthorized(url);

    if (url.startsWith('/method/')) return invokeMethod(url, config.params || {}, 'GET');
    if (url.startsWith('/resource/') && url.split('/').length <= 3) return listResource(url, config.params);
    if (url.startsWith('/resource/')) return getResourceById(url);

    throw makeAxiosError(`Unsupported GET endpoint: ${url}`, 404);
  },

  async post(url, payload = {}) {
    await ensureAuthorized(url);

    if (url.startsWith('/method/')) return invokeMethod(url, payload, 'POST');

    if (url.startsWith('/resource/')) {
      const table = getTableFromResourcePath(url);
      const insertPayload = { ...payload };
      if (insertPayload.name && !insertPayload.id) insertPayload.id = insertPayload.name;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(true),
          Prefer: 'return=representation',
        },
        body: JSON.stringify(insertPayload),
      });

      const data = await handleSupabaseResponse(response);
      return toAxiosLikeResponse({ data: normalizeRow(data?.[0] || {}) });
    }

    throw makeAxiosError(`Unsupported POST endpoint: ${url}`, 404);
  },

  async put(url, payload = {}) {
    await ensureAuthorized(url);

    if (url.startsWith('/resource/')) {
      const cleaned = url.replace(/^\/resource\//, '');
      const [rawResource, ...rawIdParts] = cleaned.split('/');
      const resourceName = decodeURIComponent(rawResource);
      const id = decodeURIComponent(rawIdParts.join('/'));
      const table = RESOURCE_TABLE_MAP[resourceName] || resourceName.toLowerCase().replace(/\s+/g, '_');

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(true),
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      });

      const data = await handleSupabaseResponse(response);
      return toAxiosLikeResponse({ data: normalizeRow(data?.[0] || {}) });
    }

    if (url.startsWith('/method/')) return invokeMethod(url, payload, 'PUT');

    throw makeAxiosError(`Unsupported PUT endpoint: ${url}`, 404);
  },
};

export default frappeApi;
