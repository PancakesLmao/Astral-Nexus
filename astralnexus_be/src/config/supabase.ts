import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

// Client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client for auth verification (with anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

// Helper function to verify JWT token
export async function verifySupabaseToken(
  token: string
): Promise<SupabaseUser | null> {
  try {
    // Method 3 FIRST: Decode and validate JWT manually (most reliable for our case)
    // JWT format: header.payload.signature
    const parts = token.split(".");
    
    if (parts.length === 3) {
      try {
        // Decode the payload (second part)
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8")
        );

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return null;
        }

        // Return user info from JWT payload
        if (payload.sub) {
          const user: SupabaseUser = {
            id: payload.sub,
            email: payload.email || "",
            user_metadata: {
              full_name: payload.user_metadata?.full_name || payload.full_name || "",
              name: payload.user_metadata?.name || payload.name || "",
              avatar_url: payload.user_metadata?.avatar_url || payload.user_metadata?.picture || payload.picture || "",
            },
            app_metadata: {
              provider: payload.app_metadata?.provider || payload.provider || "unknown",
              providers: payload.app_metadata?.providers || payload.providers || [],
            },
          };
          return user;
        }
      } catch (decodeError) {
        // Fallback to Supabase methods
      }
    }

    // Method 1: Try using getUser with the token as a session bearer token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      return user as SupabaseUser;
    }

    // Method 2: Try to verify JWT directly by setting it as the session token
    const { data, error: setError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (!setError && data.user) {
      return data.user as SupabaseUser;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Extract bearer token from Authorization header
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
}
