
-- Drop the restrictive INSERT policy and replace with one that allows all authenticated inserts
DROP POLICY "Users can send friend request mail" ON public.mailbox_messages;
CREATE POLICY "Authenticated users can insert mail" ON public.mailbox_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);
