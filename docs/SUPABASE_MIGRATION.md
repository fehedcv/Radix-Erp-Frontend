# Supabase Backend Migration Guide

## What was migrated

The frontend backend integration was migrated from **Frappe REST/method APIs** to **Supabase** in three layers:

1. **Authentication (Supabase Auth)**
   - Legacy login endpoint calls (`mobile_login`) are now routed to `POST /auth/v1/token?grant_type=password`.
   - Legacy signup endpoint calls (`agent_signup`) are now routed to `POST /auth/v1/signup`.
   - Session tokens are saved in local storage as:
     - `sb_access_token`
     - `sb_refresh_token`
   - `whoami` now reads the authenticated user from `GET /auth/v1/user` and role metadata from the `profiles` table.

2. **Database access (Supabase PostgREST)**
   - Legacy `/resource/*` calls now query Supabase tables through `/rest/v1/*`.
   - Current table mapping:
     - `Business Unit` -> `business_units`
     - `Lead` -> `leads`
     - `User` -> `profiles`
     - `Agent Credit Ledger` -> `agent_credit_ledger`
   - Frappe-like response compatibility is preserved (`{ data: ... }` with `name` and `creation` compatibility fields).

3. **Backend business logic (Supabase Edge Functions)**
   - Legacy `/method/business_chain.*` calls are routed to Supabase Edge Functions.
   - Function naming convention used in this frontend:
     - `business_chain.api.admin.get_admin_dashboard_data`
     - becomes
     - `business_chain_api_admin_get_admin_dashboard_data`
   - Payload includes `{ method, ...payload }` so edge functions can branch per HTTP semantics if needed.

4. **File upload migration (Supabase Storage)**
   - File-based endpoints (`upload_file`, profile picture upload, business logo upload) are routed to Supabase Storage bucket `uploads`.
   - Public URL format expected by frontend:
     - `${VITE_SUPABASE_URL}/storage/v1/object/public/uploads/<path>`

---

## Files changed in the migration

- `src/api/frappeApi.js`
  - Replaced Axios/Frappe integration with Supabase adapter layer.
  - Maintains existing `frappeApi.get/post/put` interface so page-level code remains mostly unchanged.
- `src/App.jsx`
  - Logout now clears Supabase session token keys.
- Image URL host replacements:
  - `src/pages/admin/BusinessControl.jsx`
  - `src/pages/business/PortfolioManager.jsx`
  - `src/pages/agent/BusinessDirectory.jsx`
  - `src/pages/agent/BusinessDirectoryApp.jsx`
  - `src/pages/agent/BusinessDetail.jsx`
  - `src/pages/agent/BusinessDetailApp.jsx`
  - `src/pages/agent/Profile.jsx`

---

## Required environment variables

Set these in `.env`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_STORAGE_PUBLIC_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public
```

> Note: `VITE_SUPABASE_STORAGE_PUBLIC_URL` is used by UI image URL resolvers. If omitted, only absolute URLs returned by the backend will render correctly.

---

## Supabase setup checklist

### 1) Auth

- Enable Email/Password in Supabase Auth provider settings.
- Ensure signup confirmation behavior matches your desired UX (immediate sign-in vs email confirm).

### 2) Database tables

Create or map these tables to match frontend expectations:

- `profiles` (should include: `id`, `primary_role`, `roles`, `full_name`, `phone`, etc.)
- `business_units`
- `leads`
- `agent_credit_ledger`

If you migrated from Frappe, align column names used by UI forms (for example: `business_name`, `category`, `status`, `manager_name`, etc.).

### 3) Row Level Security (RLS)

- Enable RLS on all user-facing tables.
- Add read/write policies for authenticated users by role (`agent`, `business`, `admin`) as needed.
- Ensure edge functions use service role only where strictly required.

### 4) Storage

- Create bucket: `uploads`.
- Configure bucket visibility/policies as needed:
  - Public read (if using direct image URLs in app), and
  - Authenticated write for uploads.

### 5) Edge Functions

Create edge functions for each legacy method path used by the frontend (dot path replaced by underscores), including for example:

- `business_chain_api_admin_get_admin_dashboard_data`
- `business_chain_api_admin_get_team_data`
- `business_chain_api_admin_get_credit_settlement_data`
- `business_chain_api_admin_get_leads_business_units_services`
- `business_chain_api_admin_delete_business_unit`
- `business_chain_api_agent_get_agent_dashboard_data`
- `business_chain_api_agent_get_agent_profile`
- `business_chain_api_agent_update_agent_profile`
- `business_chain_api_api_get_my_lead_history`
- `business_chain_api_api_get_business_unit`
- `business_chain_api_leads_submit_lead`
- `business_chain_api_leads_get_business_leads`
- `business_chain_api_leads_get_business_lead_detail`
- `business_chain_api_leads_update_lead_status`
- `business_chain_api_leads_settle_agent_credit`
- `business_chain_api_wallet_get_agent_wallet`
- `business_chain_api_wallet_get_withdrawal_requests`
- `business_chain_api_wallet_request_withdrawal`
- `business_chain_api_business_dashboard_get_business_overview`
- `business_chain_api_business_unit_get_my_business_unit`
- `business_chain_api_business_unit_update_my_business_unit`

---


## One-command bootstrap file

A bootstrap script was added to scaffold the required database objects and edge function folders:

- `supabase/setup_supabase_backend.sh`

Run it with:

```bash
PROJECT_REF=YOUR_PROJECT_REF DB_PASSWORD=YOUR_DB_PASSWORD ./supabase/setup_supabase_backend.sh
```

This script generates and executes `supabase/setup_supabase_backend.sql`, creates core tables/policies/storage bucket, and scaffolds all required edge function directories.

---

## Local run

```bash
npm install
npm run dev
```

If login fails, verify:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct.
- Auth provider allows password login.
- User exists and role is present (`profiles.primary_role` or auth metadata).

---

## Important compatibility notes

- The frontend still imports `frappeApi`, but this module now acts as a **Supabase compatibility adapter**.
- This approach minimizes page/component rewrites while fully switching transport/auth/storage backend providers.
- Any remaining backend differences should be handled in Supabase edge functions and table schema/policies.
