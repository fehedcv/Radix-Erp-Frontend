import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  user_id: string;
  title: string;
  body: string;
  route?: string;
  data?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Google OAuth2 — exchange service-account credentials for a bearer token
// ---------------------------------------------------------------------------

async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encodeB64Url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const headerB64 = encodeB64Url(header);
  const payloadB64 = encodeB64Url(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Normalise private key — parse line by line to avoid any stray characters
  // that cause atob to throw InvalidCharacterError
  const pemBody = privateKeyPem
    .replace(/\\n/g, "\n")   // unescape literal \n from env var storage
    .split("\n")
    .filter((line) => line.trim().length > 0 && !line.includes("-----"))
    .join("");

  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signingInput}.${signatureB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to obtain Google access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

// ---------------------------------------------------------------------------
// FCM HTTP v1 — send one message
// ---------------------------------------------------------------------------

async function sendFcmMessage(
  projectId: string,
  accessToken: string,
  token: string,
  platform: "web" | "android",
  title: string,
  body: string,
  data: Record<string, string>
): Promise<{ success: boolean; shouldRemove: boolean }> {
  const message: Record<string, unknown> = {
    token,
    notification: { title, body },
    data,
  };

  if (platform === "android") {
    message.android = { priority: "high" };
  } else {
    message.webpush = {
      notification: { title, body, icon: "/vite.svg" },
      fcm_options: data.route ? { link: data.route } : {},
    };
  }

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message }),
    }
  );

  if (res.ok) return { success: true, shouldRemove: false };

  const err = await res.json();
  const errorCode = err?.error?.details?.[0]?.errorCode ?? err?.error?.status ?? "";

  // These error codes indicate the token is permanently invalid
  const invalidCodes = [
    "UNREGISTERED",
    "INVALID_ARGUMENT",
    "NOT_FOUND",
  ];

  const shouldRemove = invalidCodes.some((code) =>
    errorCode.includes(code)
  );

  console.error(`[FCM] Send failed for ${platform} token — ${errorCode}`);
  return { success: false, shouldRemove };
}

// ---------------------------------------------------------------------------
// CORS headers
// ---------------------------------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, route, data: extraData }: RequestBody =
      await req.json();

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "user_id, title, and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Firebase Admin credentials from edge function secrets
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
    const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
    const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY")!;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase credentials not configured in edge function secrets");
    }

    // Supabase service-role client (bypasses RLS to read push_tokens)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all tokens for the target user
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("id, token, platform")
      .eq("user_id", user_id);

    if (tokensError) throw tokensError;
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No push tokens found for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    // Normalise data values to strings (FCM data must be string:string)
    const dataPayload: Record<string, string> = {
      ...(route ? { route } : {}),
      ...(extraData
        ? Object.fromEntries(
            Object.entries(extraData).map(([k, v]) => [k, String(v)])
          )
        : {}),
    };

    const tokensToRemove: string[] = [];
    let sentCount = 0;

    await Promise.all(
      tokens.map(async ({ id, token, platform }) => {
        const { success, shouldRemove } = await sendFcmMessage(
          projectId,
          accessToken,
          token,
          platform as "web" | "android",
          title,
          body,
          dataPayload
        );

        if (success) {
          sentCount++;
        } else if (shouldRemove) {
          tokensToRemove.push(id);
        }
      })
    );

    // Remove invalid/expired tokens
    if (tokensToRemove.length > 0) {
      await supabase.from("push_tokens").delete().in("id", tokensToRemove);
      console.log(`[send-notification] Removed ${tokensToRemove.length} invalid token(s)`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        removed: tokensToRemove.length,
        total: tokens.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-notification] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
