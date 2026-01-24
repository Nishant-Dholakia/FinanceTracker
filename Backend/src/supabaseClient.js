import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ENV DEBUG:", process.env);
  throw new Error("Supabase env variables not loaded");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);
