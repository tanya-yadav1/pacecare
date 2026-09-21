CREATE TABLE public.pace_creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('drawing','story','message')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shared_with_staff BOOLEAN NOT NULL DEFAULT false,
  shared_with_family BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pace_creations TO authenticated;
GRANT ALL ON public.pace_creations TO service_role;

ALTER TABLE public.pace_creations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents manage their own creations"
ON public.pace_creations FOR ALL TO authenticated
USING (auth.uid() = resident_id)
WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Staff can view shared creations"
ON public.pace_creations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'staff') AND shared_with_staff);

CREATE INDEX pace_creations_resident_idx ON public.pace_creations (resident_id, created_at DESC);