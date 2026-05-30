import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : undefined;

// Skip navigator.locks in two environments where it causes getSession() to hang:
//
//   1. Brave browser — Shields block the Web Locks API entirely.
//
//   2. Capacitor Android/iOS — when the WebView is paused (app goes to
//      background), any pending lock.request callback is suspended by the OS.
//      On resume the lock appears orphaned; the next getSession() call waits
//      until lockAcquireTimeout fires before forcefully stealing it, during
//      which ALL auth and API requests are blocked.
//
// In both cases there is only one "tab" so cross-tab lock coordination
// provides no benefit — replacing it with a no-op is safe.
const _skipLock =
  (typeof navigator !== 'undefined' && !!navigator.brave) ||
  Capacitor.isNativePlatform();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage,
		lockAcquireTimeout: _skipLock ? 1 : 30000,
		...(_skipLock && {
			lock: async (_name, _timeout, fn) => fn(),
		}),
	}
});
