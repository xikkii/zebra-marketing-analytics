import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  logger.error("SUPABASE_URL environment variable is required");
  process.exit(1);
}

if (!supabaseAnonKey) {
  logger.error("SUPABASE_ANON_KEY environment variable is required");
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
