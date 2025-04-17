import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://smbtuojsbjkaewxnebas.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYnR1b2pzYmprYWV3eG5lYmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjM3NDgsImV4cCI6MjA2MDM5OTc0OH0.J_QuxddDBPpUsi-n3m0pOwfJr5Lz99sF94OQvfrZljk'
)
