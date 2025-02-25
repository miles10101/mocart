// config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mkrkuvrhpzscbntagqpf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcmt1dnJocHpzY2JudGFncXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTIxOTEsImV4cCI6MjA1NTI4ODE5MX0.SDZ68t0NAO4iQoT8lGvkLt6pB_kVcQvDqIK_Aqic4TM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
