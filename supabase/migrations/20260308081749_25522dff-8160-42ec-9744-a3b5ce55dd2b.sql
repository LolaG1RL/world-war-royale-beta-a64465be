
-- Clans table
CREATE TABLE public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT 'A new clan ready for war!',
  banner_color text NOT NULL DEFAULT '#dc2626',
  banner_shape text NOT NULL DEFAULT 'pointed',
  icon_id text NOT NULL DEFAULT 'swords',
  icon_color text NOT NULL DEFAULT '#ffffff',
  max_members integer NOT NULL DEFAULT 50,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clan members table
CREATE TABLE public.clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid REFERENCES public.clans(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Friends table
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- RLS for clans
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clans are viewable by everyone" ON public.clans FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create clans" ON public.clans FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Clan creator can update" ON public.clans FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- RLS for clan_members
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clan members viewable by everyone" ON public.clan_members FOR SELECT USING (true);
CREATE POLICY "Users can join clans" ON public.clan_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave clans" ON public.clan_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS for friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friends" ON public.friends FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_user_id);
CREATE POLICY "Users can send friend requests" ON public.friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend status" ON public.friends FOR UPDATE TO authenticated USING (auth.uid() = friend_user_id);
CREATE POLICY "Users can remove friends" ON public.friends FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- Make profiles viewable for leaderboard (already has SELECT policy)
-- Add index for leaderboard queries
CREATE INDEX idx_player_progress_trophies ON public.player_progress(trophies DESC);
