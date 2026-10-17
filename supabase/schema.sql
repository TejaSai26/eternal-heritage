-- Eternal Heritage Release 1 — Supabase/PostgreSQL schema
-- Run this entire file in Supabase Dashboard → SQL Editor → New query.
-- Only a public/publishable Supabase key is used by the app. Never expose a secret/service_role key.

create table if not exists public.heritage_sites (
  id text primary key,
  title text not null,
  short_title text not null,
  city text not null,
  state text not null,
  period text not null,
  category text not null,
  description text not null,
  image_url text not null,
  image_alt text not null,
  source_title text not null,
  source_url text not null,
  tags text[] not null default '{}'::text[],
  is_published boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.heritage_stories (
  id text primary key,
  site_id text not null references public.heritage_sites(id) on delete cascade,
  title text not null,
  category text not null,
  read_time text not null default '3 min read',
  summary text not null,
  body text not null,
  interest_tags text[] not null default '{}'::text[],
  target_states text[] not null default '{}'::text[],
  related_to_site_id text references public.heritage_sites(id) on delete set null,
  source_title text not null,
  source_url text not null,
  review_status text not null default 'needs_review' check (review_status in ('needs_review', 'verified')),
  is_published boolean not null default false,
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 80),
  age_band text not null check (age_band in ('Under 18', '18–24', '25–34', '35–44', '45–59', '60+')),
  state text not null check (state in (
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  )),
  interests text[] not null check (
    cardinality(interests) > 0 and interests <@ array[
      'cooking', 'anime', 'architecture', 'sculpture', 'history', 'mythology',
      'dance_music', 'crafts', 'photography', 'nature', 'festivals', 'temples'
    ]::text[]
  ),
  preferred_language text not null default 'English' check (
    preferred_language in ('English', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'हिन्दी (Hindi)')
  ),
  recently_visited_site_id text references public.heritage_sites(id) on delete set null,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_visits (
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id text not null references public.heritage_sites(id) on delete cascade,
  visited_at timestamptz not null default now(),
  primary key (user_id, site_id)
);

create index if not exists heritage_sites_published_sort_idx on public.heritage_sites (is_published, sort_order);
create index if not exists heritage_stories_published_idx on public.heritage_stories (is_published, review_status);
create index if not exists heritage_stories_site_idx on public.heritage_stories (site_id);
create index if not exists user_visits_user_recent_idx on public.user_visits (user_id, visited_at desc);

-- Start with a deliberately small, source-linked catalogue. Expand only after source review.
insert into public.heritage_sites
(id, title, short_title, city, state, period, category, description, image_url, image_alt, source_title, source_url, tags, is_published, sort_order)
values
(
  'tirumala', 'Sri Venkateswara Temple', 'Tirumala', 'Tirumala, Tirupati', 'Andhra Pradesh', 'Living heritage', 'Pilgrimage & traditions',
  'A major pilgrimage destination whose stories include sacred offerings, a temple kitchen and traditions that continue today.',
  'https://images.unsplash.com/photo-1759134334340-9398d9814bcb?auto=format&fit=crop&w=1500&q=85',
  'An intricately sculpted South Indian temple tower.', 'Tirumala Tirupati Devasthanams — Temple History', 'https://www.tirumala.org/TTDTempleHistory.aspx',
  array['temples','history','traditions','cooking','food','mythology'], true, 1
),
(
  'yadadri', 'Yadagirigutta Temple', 'Yadadri', 'Yadadri Bhuvanagiri', 'Telangana', 'Living heritage', 'Hill shrine',
  'A Telangana hill shrine associated with Sri Lakshmi Narasimha Swamy and a long-standing pilgrimage tradition.',
  'https://images.unsplash.com/photo-1762415796791-039fe54e36b1?auto=format&fit=crop&w=1400&q=85',
  'Intricate carvings on the exterior of a historic temple.', 'Yadadri Bhuvanagiri District — Yadagirigutta', 'https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/',
  array['temples','history','traditions','mythology','nature'], true, 2
),
(
  'lepakshi', 'Veerabhadra Temple', 'Lepakshi', 'Lepakshi', 'Andhra Pradesh', '16th century', 'Architecture & murals',
  'A historic temple celebrated for sculptural detail, painted ceilings and distinctive Vijayanagara-era architectural features.',
  'https://images.unsplash.com/photo-1768921350453-043bcacc1ed9?auto=format&fit=crop&w=1400&q=85',
  'Carved stone details of a historic Indian temple.', 'Incredible India — Explore the Lepakshi Temple', 'https://www.incredibleindia.gov.in/en/andhra-pradesh/anantapur/lepakshi-temple',
  array['temples','architecture','sculpture','history','photography','crafts'], true, 3
),
(
  'brihadeeswarar', 'Brihadisvara Temple', 'Brihadisvara', 'Thanjavur', 'Tamil Nadu', '11th century', 'Chola architecture',
  'A great Chola temple that demonstrates the achievements of South Indian architecture, sculpture and painting.',
  'https://images.unsplash.com/photo-1759134334340-9398d9814bcb?auto=format&fit=crop&w=1400&q=85',
  'A traditional South Indian temple tower with detailed ornament.', 'UNESCO — Great Living Chola Temples', 'https://whc.unesco.org/en/list/250/',
  array['temples','architecture','sculpture','history','dance_music','photography'], true, 4
),
(
  'hampi', 'Group of Monuments at Hampi', 'Hampi', 'Hampi, Vijayanagara', 'Karnataka', '14th–16th century', 'Sacred & royal city',
  'Explore surviving temples, halls, gateways and urban remains of the Vijayanagara capital.',
  'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1400&q=85',
  'Historic Indian stone architecture in a dramatic landscape.', 'UNESCO — Group of Monuments at Hampi', 'https://whc.unesco.org/en/list/241/',
  array['temples','architecture','sculpture','history','mythology','nature','photography','anime'], true, 5
),
(
  'konark', 'Sun Temple, Konârak', 'Konark', 'Konark', 'Odisha', '13th century', 'Sculptural storytelling',
  'A monumental representation of Surya’s chariot, with carved wheels and reliefs that reward close observation.',
  'https://images.unsplash.com/photo-1768921350453-043bcacc1ed9?auto=format&fit=crop&w=1400&q=85',
  'Intricately carved stonework at an Indian heritage monument.', 'UNESCO — Sun Temple, Konârak', 'https://whc.unesco.org/en/list/246/',
  array['temples','architecture','sculpture','history','mythology','photography','dance_music','anime'], true, 6
),
(
  'khajuraho', 'Khajuraho Group of Monuments', 'Khajuraho', 'Khajuraho', 'Madhya Pradesh', '10th–11th century', 'Temple sculpture',
  'A group of temples known for their sculptural programme, artistic detail and architectural coherence.',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1400&q=85',
  'Ornate Indian temple architecture and stone sculpture.', 'UNESCO — Khajuraho Group of Monuments', 'https://whc.unesco.org/en/list/240/',
  array['temples','architecture','sculpture','history','mythology','dance_music'], true, 7
),
(
  'modhera', 'Sun Temple, Modhera', 'Modhera', 'Modhera, Mehsana', 'Gujarat', '11th century', 'Solar architecture',
  'A sun temple complex where architectural layout and sculpted surfaces invite careful exploration.',
  'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=1400&q=85',
  'Historic stone architecture in India.', 'UNESCO — Sun Temple, Modhera and its adjoining monuments', 'https://whc.unesco.org/en/tentativelists/6627',
  array['temples','architecture','sculpture','history','mythology','photography'], true, 8
)
on conflict (id) do nothing;

insert into public.heritage_stories
(id, site_id, title, category, read_time, summary, body, interest_tags, target_states, related_to_site_id, source_title, source_url, review_status, is_published, reviewed_at)
values
(
  'tirumala-laddu', 'tirumala', 'The story behind Tirumala’s famous laddu', 'Food & living traditions', '3 min read',
  'Follow the food tradition through its ingredients and the temple kitchen that prepares sacred offerings.',
  'In a 3 June 2026 update, Tirumala Tirupati Devasthanams listed the large-scale raw materials used for Srivari Laddu: sugar, gram flour, ghee, cashews, raisins, cardamom and sugar candy. TTD also describes prescribed ingredient proportions as “Dittam” standards. These are institutional production figures, not a complete home recipe; use the official source for context and any newer updates.',
  array['cooking','food','traditions','history'], array['Andhra Pradesh'], 'tirumala',
  'TTD — Srivari Laddu production and raw materials', 'https://news.tirumala.org/sacred-laddu-sales-hits-all-time-high-in-may-_-%E0%B0%AE%E0%B1%87-%E0%B0%A8%E0%B1%86%E0%B0%B2%E0%B0%B2%E0%B1%8B-%E0%B0%B0%E0%B0%BF%E0%B0%95%E0%B0%BE%E0%B0%B0%E0%B1%8D%E0%B0%A1%E0%B1%81/',
  'verified', true, '2026-10-16'
),
(
  'yadadri-connection', 'yadadri', 'A hill shrine in your state', 'A place close to home', '2 min read',
  'If you live in Telangana and visited Tirumala, explore Yadagirigutta as another major pilgrimage destination in your state.',
  'Yadagirigutta is associated with Sri Lakshmi Narasimha Swamy and is described by the Telangana district administration as a well-known pilgrimage destination. The deities and traditions differ from Tirumala, so this is a suggested comparison between pilgrimage places—not a claim that the temples are identical.',
  array['temples','mythology','traditions','history','nature'], array['Telangana'], 'tirumala',
  'Yadadri Bhuvanagiri District — Yadagirigutta', 'https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/',
  'verified', true, '2026-10-16'
),
(
  'lepakshi-connection', 'lepakshi', 'A sculptural journey in Andhra Pradesh', 'Regional discovery', '2 min read',
  'If you live in Andhra Pradesh, continue exploring temple art through Lepakshi’s historic architecture and carvings.',
  'The Government of India’s Incredible India site describes Lepakshi as a heritage destination in Andhra Pradesh, known for the Veerabhadra Temple, its distinctive hanging pillar, monolithic Nandi and Vijayanagara-style architecture. This gives visitors a nearby regional discovery after a Tirumala visit; the temples have different histories and traditions.',
  array['temples','architecture','sculpture','photography','history'], array['Andhra Pradesh'], 'tirumala',
  'Incredible India — Explore the Lepakshi Temple', 'https://www.incredibleindia.gov.in/en/andhra-pradesh/anantapur/lepakshi-temple',
  'verified', true, '2026-10-16'
),
(
  'tirumala-kitchen', 'tirumala', 'Inside the temple kitchen tradition', 'Ritual & practice', '3 min read',
  'Learn what the official temple history says about the Potu kitchen and the preparation of offerings.',
  'TTD’s temple history page describes the Padi Potu as the temple kitchen where sweets and savouries—including laddu, vada, appam and other offerings—are prepared. This connects culinary curiosity to a specific place, practice and source rather than an unsourced recipe.',
  array['cooking','food','traditions','history','temples'], array[]::text[], 'tirumala',
  'TTD — Temple History', 'https://www.tirumala.org/TTDTempleHistory.aspx',
  'verified', true, '2026-10-16'
),
(
  'visual-storytelling', 'konark', 'Myth, motifs and visual storytelling', 'For visual-story lovers', '3 min read',
  'Use the lens of character design and world-building to look more closely at temple sculpture—without confusing modern anime with historical heritage.',
  'If anime draws you in through character design, symbolic details and visual storytelling, temple sculpture offers a different historical art form to examine: poses, repeated motifs, figures and narrative reliefs. UNESCO describes the Konark Sun Temple as a monumental representation of Surya’s chariot, with carved wheels and sculptural embellishment. This is a way to look closely at visual storytelling, not a claim of a historical connection to anime.',
  array['anime','mythology','sculpture','photography','history','architecture'], array[]::text[], null,
  'UNESCO — Sun Temple, Konârak', 'https://whc.unesco.org/en/list/246/',
  'verified', true, '2026-10-16'
),
(
  'chola-engineering', 'brihadeeswarar', 'How Chola architecture makes scale feel human', 'Architecture & engineering', '4 min read',
  'Look at the relationship between tower, courtyard, sculpture and movement in a landmark Chola temple.',
  'UNESCO describes the Great Living Chola Temples as outstanding testimony to Chola architecture and art. The Thanjavur Brihadisvara Temple’s towering vimana, sculpted surfaces and extensive temple complex offer a case study in how structure, ornament and ritual space work together.',
  array['architecture','sculpture','history','photography','temples','dance_music'], array['Tamil Nadu'], null,
  'UNESCO — Great Living Chola Temples', 'https://whc.unesco.org/en/list/250/',
  'verified', true, '2026-10-16'
),
(
  'hampi-worldbuilding', 'hampi', 'A city built from many stories', 'History & world-building', '4 min read',
  'Explore temples, public spaces and royal structures as pieces of one historic city.',
  'UNESCO describes Hampi as the remains of the Vijayanagara capital, encompassing temples, shrines, pillared halls, gateways, royal complexes, water structures and more. Looking at these pieces together reveals a historic city rather than a collection of isolated monuments.',
  array['history','architecture','anime','mythology','photography','nature','sculpture'], array['Karnataka'], null,
  'UNESCO — Group of Monuments at Hampi', 'https://whc.unesco.org/en/list/241/',
  'verified', true, '2026-10-16'
),
(
  'konark-chariot', 'konark', 'Read the Sun Temple as a stone chariot', 'Symbols & sculpture', '3 min read',
  'Follow the chariot idea through the temple’s carved wheels and sculptural programme.',
  'UNESCO describes Konark as a monumental representation of the sun god Surya’s chariot and notes its 24 carved wheels and sculptural embellishment. The architecture provides a rich entry point for exploring symbolism and craftsmanship.',
  array['temples','architecture','sculpture','mythology','history','photography','dance_music','anime'], array['Odisha'], null,
  'UNESCO — Sun Temple, Konârak', 'https://whc.unesco.org/en/list/246/',
  'verified', true, '2026-10-16'
)
on conflict (id) do nothing;

-- Private tables: each account can access only rows linked to its own auth.uid().
alter table public.profiles enable row level security;
alter table public.user_visits enable row level security;

-- Public source catalogue: anonymous and signed-in visitors may see published content only.
alter table public.heritage_sites enable row level security;
alter table public.heritage_stories enable row level security;

drop policy if exists "Published heritage sites are readable" on public.heritage_sites;
create policy "Published heritage sites are readable"
  on public.heritage_sites for select to anon, authenticated using (is_published = true);

drop policy if exists "Published verified heritage stories are readable" on public.heritage_stories;
create policy "Published verified heritage stories are readable"
  on public.heritage_stories for select to anon, authenticated using (is_published = true and review_status = 'verified');

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "Read own visits" on public.user_visits;
create policy "Read own visits" on public.user_visits for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Create own visits" on public.user_visits;
create policy "Create own visits" on public.user_visits for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "Update own visits" on public.user_visits;
create policy "Update own visits" on public.user_visits for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "Delete own visits" on public.user_visits;
create policy "Delete own visits" on public.user_visits for delete to authenticated using (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.heritage_sites, public.heritage_stories to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_visits to authenticated;

-- Supabase calls this trigger when an auth user is created. Profile details arrive as signup metadata,
-- and the profile row is created server-side rather than allowing users to insert arbitrary profile rows.
create or replace function public.handle_new_heritage_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_interests text[];
  v_recent_site text;
begin
  select coalesce(array_agg(item.value), '{}'::text[])
    into v_interests
    from jsonb_array_elements_text(case when jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array' then new.raw_user_meta_data -> 'interests' else '[]'::jsonb end) as item(value);

  v_recent_site := nullif(new.raw_user_meta_data ->> 'recently_visited_site_id', '');

  insert into public.profiles (
    id, full_name, age_band, state, interests, preferred_language,
    recently_visited_site_id, consent_at, created_at, updated_at
  ) values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Heritage explorer'),
    coalesce(new.raw_user_meta_data ->> 'age_band', '18–24'),
    coalesce(new.raw_user_meta_data ->> 'state', 'Andhra Pradesh'),
    v_interests,
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'English'),
    v_recent_site,
    now(), now(), now()
  )
  on conflict (id) do nothing;

  if v_recent_site is not null then
    insert into public.user_visits (user_id, site_id, visited_at)
    values (new.id, v_recent_site, now())
    on conflict (user_id, site_id) do update set visited_at = excluded.visited_at;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_heritage_profile on auth.users;
create trigger on_auth_user_created_heritage_profile
after insert on auth.users
for each row execute procedure public.handle_new_heritage_user();

-- Account deletion is permitted only for the currently authenticated account.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users where id = (select auth.uid());
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- NOTE: New editorial items should default to needs_review + unpublished. Set review_status='verified',
-- fill reviewed_at, and set is_published=true only after checking the source and factual content.
