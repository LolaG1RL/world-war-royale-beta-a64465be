
-- Auto-delete clans with 0 members
CREATE OR REPLACE FUNCTION public.auto_delete_empty_clans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- After a member leaves, check if the clan has 0 members
  IF NOT EXISTS (SELECT 1 FROM public.clan_members WHERE clan_id = OLD.clan_id) THEN
    DELETE FROM public.clans WHERE id = OLD.clan_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_auto_delete_empty_clans
  AFTER DELETE ON public.clan_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_delete_empty_clans();

-- Allow clan leaders to delete clans
CREATE POLICY "Clan leaders can delete clans"
  ON public.clans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow clan leaders to update member roles
CREATE POLICY "Clan leaders can update members"
  ON public.clan_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clan_members cm
      WHERE cm.clan_id = clan_members.clan_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'leader'
    )
  );
