
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_year integer,
  ADD COLUMN IF NOT EXISTS music_decade text,
  ADD COLUMN IF NOT EXISTS favorite_genres text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.music_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  year integer,
  decade text,
  genre text,
  source_type text NOT NULL CHECK (source_type IN ('reference','demo_audio','public_domain_lyrics')),
  audio_url text,
  lyrics text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_items TO authenticated;
GRANT ALL ON public.music_items TO service_role;

ALTER TABLE public.music_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_items read all signed in" ON public.music_items;
CREATE POLICY "music_items read all signed in" ON public.music_items
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "music_items staff insert" ON public.music_items;
CREATE POLICY "music_items staff insert" ON public.music_items
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "music_items staff update" ON public.music_items;
CREATE POLICY "music_items staff update" ON public.music_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "music_items staff delete" ON public.music_items;
CREATE POLICY "music_items staff delete" ON public.music_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'staff'));

CREATE TABLE IF NOT EXISTS public.music_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  music_item_id uuid REFERENCES public.music_items(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('played','searched','asked_staff','surprise')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.music_plays TO authenticated;
GRANT ALL ON public.music_plays TO service_role;

ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "music_plays own read" ON public.music_plays;
CREATE POLICY "music_plays own read" ON public.music_plays
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'staff'));

DROP POLICY IF EXISTS "music_plays own insert" ON public.music_plays;
CREATE POLICY "music_plays own insert" ON public.music_plays
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

INSERT INTO public.music_items (title, artist, year, decade, genre, source_type)
SELECT v.title, v.artist, v.year, v.decade, v.genre, v.source_type FROM (VALUES
  ('In the Mood','Glenn Miller',1939,'1940s','Big Band','reference'),
  ('White Christmas','Bing Crosby',1942,'1940s','Vocal','reference'),
  ('Sentimental Journey','Doris Day',1945,'1940s','Big Band','reference'),
  ('Chattanooga Choo Choo','Glenn Miller',1941,'1940s','Big Band','reference'),
  ('Heartbreak Hotel','Elvis Presley',1956,'1950s','Rock and Roll','reference'),
  ('Rock Around the Clock','Bill Haley',1954,'1950s','Rock and Roll','reference'),
  ('Your Cheatin'' Heart','Hank Williams',1953,'1950s','Country','reference'),
  ('Take Five','Dave Brubeck',1959,'1950s','Jazz','reference'),
  ('My Girl','The Temptations',1964,'1960s','Soul','reference'),
  ('Stand By Me','Ben E. King',1961,'1960s','Soul','reference'),
  ('Yesterday','The Beatles',1965,'1960s','Pop','reference'),
  ('What a Wonderful World','Louis Armstrong',1967,'1960s','Jazz','reference'),
  ('Bridge Over Troubled Water','Simon & Garfunkel',1970,'1970s','Folk','reference'),
  ('Let It Be','The Beatles',1970,'1970s','Pop','reference'),
  ('Take Me Home, Country Roads','John Denver',1971,'1970s','Country','reference'),
  ('Lean on Me','Bill Withers',1972,'1970s','Soul','reference')
) AS v(title,artist,year,decade,genre,source_type)
WHERE NOT EXISTS (SELECT 1 FROM public.music_items m WHERE m.title = v.title AND m.artist = v.artist);

INSERT INTO public.music_items (title, artist, year, genre, source_type, lyrics)
SELECT v.title, v.artist, v.year, v.genre, 'public_domain_lyrics', v.lyrics FROM (VALUES
  ('Amazing Grace','John Newton',1779,'Gospel',
$$Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found,
Was blind, but now I see.

'Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed.

Through many dangers, toils and snares,
I have already come;
'Tis grace hath brought me safe thus far,
And grace will lead me home.$$),
  ('Take Me Out to the Ball Game','Jack Norworth',1908,'Sing along',
$$Take me out to the ball game,
Take me out with the crowd;
Buy me some peanuts and Cracker Jack,
I don't care if I never get back.

Let me root, root, root for the home team,
If they don't win, it's a shame.
For it's one, two, three strikes, you're out,
At the old ball game.$$),
  ('Oh! Susanna','Stephen Foster',1848,'Folk',
$$I come from Alabama with my banjo on my knee,
I'm going to Louisiana, my true love for to see.
It rained all night the day I left, the weather it was dry,
The sun so hot I froze to death; Susanna, don't you cry.

Oh! Susanna, oh don't you cry for me,
For I come from Alabama with my banjo on my knee.$$),
  ('Home on the Range','Daniel E. Kelley',1873,'Country',
$$Oh, give me a home where the buffalo roam,
Where the deer and the antelope play,
Where seldom is heard a discouraging word,
And the skies are not cloudy all day.

Home, home on the range,
Where the deer and the antelope play;
Where seldom is heard a discouraging word,
And the skies are not cloudy all day.$$)
) AS v(title,artist,year,genre,lyrics)
WHERE NOT EXISTS (SELECT 1 FROM public.music_items m WHERE m.title = v.title);

INSERT INTO public.music_items (title, genre, source_type, audio_url)
SELECT v.title, v.genre, 'demo_audio', NULL FROM (VALUES
  ('Gentle Morning','Classical'),
  ('Calm Waters','Nature'),
  ('Sunny Afternoon','Big Band')
) AS v(title,genre)
WHERE NOT EXISTS (SELECT 1 FROM public.music_items m WHERE m.title = v.title AND m.source_type = 'demo_audio');
