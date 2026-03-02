import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucavbbmmmsmfqnrbkbvl.supabase.co';
const supabaseAnonKey = 'sb_publishable_j1IBHf7M0OEYWJs80JIBSQ_XpsPC9c_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);