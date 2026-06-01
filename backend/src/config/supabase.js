import { createClient } from "@supabase/supabase-js";
import { env, hasSecret } from "./env.js";

export const supabase =
  hasSecret("SUPABASE_URL") && hasSecret("SUPABASE_ANON_KEY")
    ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    : null;
