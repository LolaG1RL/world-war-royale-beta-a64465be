-- Drop permissive policies
DROP POLICY IF EXISTS "Anyone can read deaf_menu_grants" ON public.deaf_menu_grants;
DROP POLICY IF EXISTS "Admin can insert deaf_menu_grants" ON public.deaf_menu_grants;
DROP POLICY IF EXISTS "Admin can delete deaf_menu_grants" ON public.deaf_menu_grants;

-- Create proper policies - only authenticated users can check their own grants
CREATE POLICY "Users can see their own grants" ON public.deaf_menu_grants
  FOR SELECT USING (auth.uid() = user_id);

-- Create security definer functions for admin operations
CREATE OR REPLACE FUNCTION public.admin_get_all_deaf_grants()
RETURNS SETOF public.deaf_menu_grants
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.deaf_menu_grants ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_grant_deaf_menu(
  p_user_id UUID,
  p_username TEXT,
  p_granted_by UUID,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.deaf_menu_grants (user_id, username, granted_by_user_id, expires_at)
  VALUES (p_user_id, p_username, p_granted_by, p_expires_at)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_deaf_menu(p_grant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.deaf_menu_grants WHERE id = p_grant_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_deaf_menu_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deaf_menu_grants
    WHERE user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;