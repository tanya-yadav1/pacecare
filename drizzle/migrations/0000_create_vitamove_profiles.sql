CREATE TABLE public.vitamove_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  motor_challenges TEXT[] NOT NULL DEFAULT '{}',
  exercise_preference TEXT NOT NULL DEFAULT 'seated',
  wellness_stars INTEGER NOT NULL DEFAULT 120,
  active_skin TEXT NOT NULL DEFAULT 'classic',
  movement_claimed BOOLEAN NOT NULL DEFAULT false,
  therapy_claimed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vitamove_profiles TO authenticated;
GRANT ALL ON public.vitamove_profiles TO service_role;
ALTER TABLE public.vitamove_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own VitaMove profile" ON public.vitamove_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own VitaMove profile" ON public.vitamove_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own VitaMove profile" ON public.vitamove_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);