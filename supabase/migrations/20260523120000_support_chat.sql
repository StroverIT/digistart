-- RLS + Realtime for support chat (tables created by Prisma).

alter publication supabase_realtime add table public.support_messages;
alter publication supabase_realtime add table public.support_chats;

alter table public.support_chats enable row level security;
alter table public.support_messages enable row level security;

-- Customers read own chats; admins read all.
create policy "support_chats_select"
  on public.support_chats
  for select
  to authenticated
  using (
    user_id = (auth.jwt() ->> 'user_id')
    or (auth.jwt() ->> 'app_role') = 'admin'
  );

-- Customers read messages in own chats; admins read all.
create policy "support_messages_select"
  on public.support_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.support_chats c
      where c.id = support_messages.chat_id
        and (
          c.user_id = (auth.jwt() ->> 'user_id')
          or (auth.jwt() ->> 'app_role') = 'admin'
        )
    )
  );
