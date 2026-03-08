
-- Allow all authenticated users to view player_progress for leaderboard
CREATE POLICY "Authenticated users can view all progress for leaderboard"
  ON public.player_progress FOR SELECT TO authenticated USING (true);
