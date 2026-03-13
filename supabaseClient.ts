import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CONFIGURATION ---
// Replace the values below with your specific project details from the Supabase Dashboard.

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to validate URL
const isValidUrl = (url: string | undefined) => {
  if (!url) return false;
  const cleanUrl = url.trim().replace(/^["']|["']$/g, '');
  return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
};

export const SUPABASE_URL = isValidUrl(envUrl)
  ? envUrl.trim().replace(/^["']|["']$/g, '')
  : "https://ecnjojzmkehjaoglbsxf.supabase.co";

export const SUPABASE_PUBLIC_KEY = envKey && envKey !== "undefined" && envKey.trim() !== "" 
  ? envKey.trim().replace(/^["']|["']$/g, '')
  : "sb_publishable_uv_fnoBXouTrrdJtuT6K5Q_3wuOyxv-";

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
