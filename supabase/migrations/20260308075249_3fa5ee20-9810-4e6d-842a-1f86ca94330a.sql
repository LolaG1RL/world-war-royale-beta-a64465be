ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS player_tag TEXT UNIQUE;

-- Generate player tags for existing profiles that don't have one
UPDATE public.profiles 
SET player_tag = '#' || UPPER(SUBSTRING(MD5(user_id::text) FROM 1 FOR 8))
WHERE player_tag IS NULL;

-- Make it NOT NULL after populating
ALTER TABLE public.profiles ALTER COLUMN player_tag SET NOT NULL;

-- Create a function to auto-generate player tags on insert
CREATE OR REPLACE FUNCTION public.generate_player_tag()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.player_tag IS NULL THEN
    NEW.player_tag := '#' || UPPER(SUBSTRING(MD5(NEW.user_id::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_player_tag
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_player_tag();