import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bucjanejcadoopxnkmzm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y2phbmVqY2Fkb29weG5rbXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjgzNTMsImV4cCI6MjA3NzQwNDM1M30.dUcP9dfdFfcQtXkdhvxIy3Pi_9jwL6MpYR1PsoslPAI';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DreamEntry {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  sleep_hours: number;
  caffeine_intake: number;
  sleep_quality: number;
  mood: string | null;
  stress_level: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
