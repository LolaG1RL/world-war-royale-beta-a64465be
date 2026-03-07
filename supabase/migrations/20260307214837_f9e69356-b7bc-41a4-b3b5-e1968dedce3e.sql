
CREATE TABLE public.player_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  max_xp INTEGER NOT NULL DEFAULT 100,
  trophies INTEGER NOT NULL DEFAULT 0,
  max_trophies INTEGER NOT NULL DEFAULT 0,
  arena INTEGER NOT NULL DEFAULT 1,
  arena_name TEXT NOT NULL DEFAULT 'Training Camp',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  three_crown_wins INTEGER NOT NULL DEFAULT 0,
  challenge_max_wins INTEGER NOT NULL DEFAULT 0,
  war_day_wins INTEGER NOT NULL DEFAULT 0,
  clan_cards_collected INTEGER NOT NULL DEFAULT 0,
  total_donations INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  gems INTEGER NOT NULL DEFAULT 10,
  star_points INTEGER NOT NULL DEFAULT 0,
  deck_ids TEXT[] NOT NULL DEFAULT ARRAY['roman-legionary','egyptian-archer','skeleton-horde','viking-raider','samurai','fireball','orc-berserker','mongol-cavalry'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.player_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.player_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.player_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_player_progress_updated_at BEFORE UPDATE ON public.player_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
