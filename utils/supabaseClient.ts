// utils/supabaseClient.ts
// -----------------------------------------------------
// This client is for SERVER/API ROUTES ONLY.
// Frontend must use SupabaseProvider → useSupabase()
// -----------------------------------------------------

import { createClient } from "@supabase/supabase-js";

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend-only
);
