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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Token verification failed:", error);
      return null;
    }

    return user as SupabaseUser;
  } catch (error) {
    console.error("Token verification error:", error);
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
