# Supabase deployment checklist

The previous bot token and service-role key were present in source code. Treat
both as compromised: regenerate the Telegram token in BotFather and rotate the
Supabase secret/service-role key before deploying this version.

1. Complete the Supabase MCP OAuth login, then apply
   `migrations/202610090001_secure_booking_and_admin.sql` in the SQL Editor.
   Do not run `FULL_DATABASE_SETUP.sql` again: it restores unsafe public RLS
   policies.
2. Create the first admin with Supabase Auth (email/password), then add its
   `auth.users.id` to `public.admin_users` using the commented bootstrap SQL at
   the end of the migration.
3. Set Edge Function secrets from `functions/.env.example` in Dashboard → Edge
   Functions → Secrets. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
   supplied by the hosted runtime; do not add their values to the repository.
4. Deploy `functions/telegram-bot`. The checked-in `config.toml` disables JWT
   verification only because Telegram cannot send a Supabase JWT; the function
   validates Telegram WebApp signatures and the webhook secret instead.
5. Set the webhook once, using the deployed function's `?setup=webhook` URL,
   then confirm Telegram `getWebhookInfo` reports no `last_error_message`.
6. Configure each Vite deployment with `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, and `VITE_BOT_API_URL`. Do not enable
   `VITE_DEMO_MODE` in production.
