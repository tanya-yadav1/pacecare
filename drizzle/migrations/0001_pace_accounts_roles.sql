-- Roles enum
CREATE TYPE public.app_role AS ENUM ('senior', 'staff');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text NOT NULL DEFAULT 'Friend',
  greeting_name text NOT NULL DEFAULT 'Friend',
  accessibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roles table (never on profiles)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Staff to resident assignments
CREATE TABLE public.resident_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, resident_id)
);
GRANT SELECT, INSERT, DELETE ON public.resident_assignments TO authenticated;
GRANT ALL ON public.resident_assignments TO service_role;
ALTER TABLE public.resident_assignments ENABLE ROW LEVEL SECURITY;

-- Caregiver-set sign-in PINs; never readable from the client
CREATE TABLE public.senior_pins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  set_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.senior_pins TO service_role;
ALTER TABLE public.senior_pins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Staff read assigned resident profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'staff')
    AND EXISTS (
      SELECT 1 FROM public.resident_assignments ra
      WHERE ra.staff_id = auth.uid() AND ra.resident_id = profiles.id
    )
  );

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff read own assignments" ON public.resident_assignments
  FOR SELECT TO authenticated USING (auth.uid() = staff_id);
CREATE POLICY "Staff create own assignments" ON public.resident_assignments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = staff_id AND public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff remove own assignments" ON public.resident_assignments
  FOR DELETE TO authenticated USING (auth.uid() = staff_id);

-- New user bootstrap: profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, display_name, greeting_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, 'Friend'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'greeting_name', NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, 'Friend'), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  requested_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' = 'staff' THEN 'staff'::public.app_role
    ELSE 'senior'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
