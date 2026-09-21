-- Requests and choices seniors make, and the activity log staff review
CREATE TABLE public.pace_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('help', 'choice', 'activity')),
  label text NOT NULL,
  detail text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  staff_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pace_events TO authenticated;
GRANT ALL ON public.pace_events TO service_role;
ALTER TABLE public.pace_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Residents read their own events"
ON public.pace_events FOR SELECT TO authenticated
USING (auth.uid() = resident_id OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Residents create their own events"
ON public.pace_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Residents and staff update events"
ON public.pace_events FOR UPDATE TO authenticated
USING (auth.uid() = resident_id OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (auth.uid() = resident_id OR public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Residents delete their own events"
ON public.pace_events FOR DELETE TO authenticated
USING (auth.uid() = resident_id);

CREATE INDEX pace_events_resident_idx ON public.pace_events (resident_id, created_at DESC);
CREATE INDEX pace_events_status_idx ON public.pace_events (status, created_at DESC);

-- Staff notes live on the profile row so staff can keep context about a resident
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_notes text;

CREATE POLICY "Staff read every profile"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff update every profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'staff'));