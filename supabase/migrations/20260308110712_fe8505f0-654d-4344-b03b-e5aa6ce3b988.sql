CREATE TABLE public.deaf_menu_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  granted_by_user_id UUID NOT NULL,
  username TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deaf_menu_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deaf_menu_grants" ON public.deaf_menu_grants
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert deaf_menu_grants" ON public.deaf_menu_grants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can delete deaf_menu_grants" ON public.deaf_menu_grants
  FOR DELETE USING (true);