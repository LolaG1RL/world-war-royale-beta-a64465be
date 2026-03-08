
-- Clan chat messages
CREATE TABLE public.clan_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT 'Unknown',
  message_type text NOT NULL DEFAULT 'chat', -- 'chat', 'trade_request', 'trade_accept'
  content text NOT NULL DEFAULT '',
  trade_card_offered text, -- card id offered
  trade_card_wanted text, -- card id wanted
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clan_messages ENABLE ROW LEVEL SECURITY;

-- Anyone in the clan can view messages (we check via clan_members)
CREATE POLICY "Clan members can view messages" ON public.clan_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clan_members cm 
    WHERE cm.clan_id = clan_messages.clan_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Clan members can send messages" ON public.clan_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.clan_members cm 
      WHERE cm.clan_id = clan_messages.clan_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages" ON public.clan_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_clan_messages_clan ON public.clan_messages(clan_id, created_at DESC);

-- Enable realtime for clan messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_messages;
