import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzejohwrbjodkbwftbsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZWpvaHdyYmpvZGtid2Z0YnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDk2NjUsImV4cCI6MjA4OTkyNTY2NX0.o6teWbjeglfXpYEJE9B8-u47NOOGA3TUSO4-UmLZmjI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => true;
export const updateSupabaseConfig = (url: string, key: string) => {
  // No-op as values are hardcoded
};
