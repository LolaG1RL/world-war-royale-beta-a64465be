
-- Mailbox messages table
CREATE TABLE public.mailbox_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid, -- NULL means worldwide/broadcast
  sender_type text NOT NULL DEFAULT 'system', -- 'system', 'admin', 'friend_request'
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'mail',
  reward_gold integer NOT NULL DEFAULT 0,
  reward_gems integer NOT NULL DEFAULT 0,
  is_read boolean NOT NULL DEFAULT false,
  is_claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.mailbox_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages sent to them OR broadcast messages
CREATE POLICY "Users can view own or broadcast mail" ON public.mailbox_messages
  FOR SELECT TO authenticated
  USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);

-- Admin/system can insert (we'll use edge function with service role)
CREATE POLICY "Authenticated users can insert mail" ON public.mailbox_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can update their own mail (mark read/claimed)
CREATE POLICY "Users can update own mail" ON public.mailbox_messages
  FOR UPDATE TO authenticated
  USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);

-- Users can delete own mail
CREATE POLICY "Users can delete own mail" ON public.mailbox_messages
  FOR DELETE TO authenticated
  USING (recipient_user_id = auth.uid());

CREATE INDEX idx_mailbox_recipient ON public.mailbox_messages(recipient_user_id);
