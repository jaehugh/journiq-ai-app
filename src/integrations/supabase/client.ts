import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rlwtvnffwscsbtlzjeqe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd3R2bmZmd3Njc2J0bHpqZXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzMwODAsImV4cCI6MjA1MDkwOTA4MH0.TdaQTut461qUCX05bmdaDosk7oYBeN_Oe3khND0xGms";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);