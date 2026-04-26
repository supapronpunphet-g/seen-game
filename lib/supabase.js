import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[supabase] missing env vars",
    {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
    },
    "— ตรวจ webgame/.env.local แล้ว restart npm run dev"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
