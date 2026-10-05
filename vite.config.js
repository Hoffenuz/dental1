import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from system and .env files
  const env = loadEnv(mode, process.cwd(), '');

  const defaultSupabaseUrl = 'https://jvzghreavlzjpxhnasxd.supabase.co';
  const defaultSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2emdocmVhdmx6anB4aG5hc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDI2OTcsImV4cCI6MjEwMDg3ODY5N30.bRCRxNOR32VEcI8Pd-0OpSvtfESC1UyTpeJ1TItA0Y4';
  const defaultBotApiUrl = 'https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot';
  const defaultBotUsername = 'dentalclinicuzbot';

  const cleanString = (val, fallback = '') => {
    if (!val) return fallback;
    const str = String(val).trim().replace(/^["']|["']$/g, '');
    if (!str || str === 'undefined' || str === 'null' || str.includes('placeholder')) {
      return fallback;
    }
    return str;
  };

  // Support both VITE_ and non-VITE_ variable names (useful for Netlify dashboard)
  const rawUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const rawKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const rawBotApi = env.VITE_BOT_API_URL || env.BOT_API_URL || process.env.VITE_BOT_API_URL || process.env.BOT_API_URL;
  const rawBotUser = env.VITE_TELEGRAM_BOT_USERNAME || env.TELEGRAM_BOT_USERNAME || process.env.VITE_TELEGRAM_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME;

  const supabaseUrl = cleanString(rawUrl, defaultSupabaseUrl).replace(/\/+$/, '');
  const supabaseKey = cleanString(rawKey, defaultSupabaseKey);
  const botApiUrl = cleanString(rawBotApi, defaultBotApiUrl);
  const botUsername = cleanString(rawBotUser, defaultBotUsername).replace(/^@/, '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.VITE_BOT_API_URL': JSON.stringify(botApiUrl),
      'import.meta.env.VITE_TELEGRAM_BOT_USERNAME': JSON.stringify(botUsername)
    },
    server: {
      port: 3001,
      host: true
    }
  };
});
