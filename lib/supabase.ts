import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xhmlzlgidjkftzwnqrdb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhobWx6bGdpZGprZnR6d25xcmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzMxNzQsImV4cCI6MjA2OTkwOTE3NH0.t6--9MQly3o0VkkQBbkIWylNwFb35CNevyzCGLktGKQ";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});