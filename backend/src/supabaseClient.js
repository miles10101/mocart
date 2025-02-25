// C:\Users\oyooc\Desktop\mocart\backend\src\supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mkrkuvrhpzscbntagqpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcmt1dnJocHpzY2JudGFncXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTIxOTEsImV4cCI6MjA1NTI4ODE5MX0.SDZ68t0NAO4iQoT8lGvkLt6pB_kVcQvDqIK_Aqic4TM';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
