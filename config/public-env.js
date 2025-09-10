// Public runtime config for the browser
// IMPORTANT: This file is shipped to the client. Only put public/anon keys here.
// To enable cloud sync, fill in your Supabase project details below.
// You can keep this file under version control since anon keys are safe to expose.

window.ENV = {
  // e.g. https://your-project-ref.supabase.co
  SUPABASE_URL: 'https://mtogfawlowssntjvtaow.supabase.co',
  // e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b2dmYXdsb3dzc250anZ0YW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjU4OTAsImV4cCI6MjA3MzAwMTg5MH0.-u7N2IfmZXhhZTFgCxrZO4MA4kV0AkKQA9p5-WAxyX0',
  // Optional: bucket name for images (defaults to 'riddles')
  SUPABASE_BUCKET: 'riddles',

  // Optional: SiliconFlow (for auto cover generation)
  // WARN: This file is public. Prefer setting via localStorage ENV_ keys for admin-only use.
  // Example (in browser console):
  //   localStorage.setItem('ENV_SILICONFLOW_API_KEY','sk-...')
  //   localStorage.setItem('ENV_SILICONFLOW_PROXY_URL','https://api.siliconflow.cn')
  SILICONFLOW_API_KEY: 'sk-wxfsotjcavldkdcgavgjjswbfzuilfrxzazleqxujjkytevx',
  SILICONFLOW_PROXY_URL: 'https://api.siliconflow.cn'
};

// After filling values, reload the site and check the console:
//   SupabaseUtil.isConfigured() should return true, and list page will fetch from cloud.
