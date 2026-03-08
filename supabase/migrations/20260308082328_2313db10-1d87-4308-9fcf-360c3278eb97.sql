
-- Tighten the INSERT policy - only allow inserting mail for yourself (friend requests) or use service role for admin
DROP POLICY "Authenticated users can insert mail" ON public.mailbox_messages;
CREATE POLICY "Users can send friend request mail" ON public.mailbox_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_type = 'friend_request');
