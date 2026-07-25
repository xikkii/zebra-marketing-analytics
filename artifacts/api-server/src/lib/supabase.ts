import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer the newer publishable key; fall back to the anon key
const supabaseKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  logger.error("SUPABASE_URL environment variable is required");
  process.exit(1);
}

if (!supabaseKey) {
  logger.error(
    "SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY environment variable is required",
  );
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
