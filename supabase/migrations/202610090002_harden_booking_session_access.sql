-- Keep the Telegram booking state server-only and prevent anonymous RPC calls.
begin;

revoke execute on function public.is_clinic_admin(uuid) from public, anon, service_role;
grant execute on function public.is_clinic_admin(uuid) to authenticated;

-- The Edge Function uses service_role (which bypasses RLS).  This explicit
-- policy documents that access and keeps every exposed table policy-covered.
create policy "service role manages Telegram booking sessions"
  on public.telegram_booking_sessions
  for all to service_role
  using (true)
  with check (true);

commit;
