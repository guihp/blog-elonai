-- Run once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Stores every signup from the site: book downloads, waitlists and the newsletter.
create table if not exists public.subscribers (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  kind            text not null check (kind in ('download', 'waitlist', 'newsletter')),
  email           text not null,
  first_name      text,
  state           text,
  book            text,
  prayer_request  text,
  email_reminders boolean not null default true,
  share_request   boolean not null default false,
  source          text,
  prayed_at       timestamptz,         -- mark when the team has prayed for the request
  -- optional market-research questions on the download form (allowed answers: src/lib/survey.ts)
  heard_from      text,
  heart_topic     text,
  age_range       text
);

create index if not exists subscribers_email_idx on public.subscribers (email);
create index if not exists subscribers_kind_book_idx on public.subscribers (kind, book);
create index if not exists subscribers_created_idx on public.subscribers (created_at desc);

-- Only the server (service role key in /api/subscribe) can read or write. Visitors never touch the table directly.
alter table public.subscribers enable row level security;

-- Site analytics for the admin dashboard (/admin). No cookies and no IP addresses are stored:
-- `visitor` is a salted hash that changes every day.
create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  -- form_open = opened the download box, signup = sent a form, read = left a page (depth % and seconds)
  kind        text not null check (kind in ('view', 'download', 'donate', 'community', 'form_open', 'signup', 'read')),
  path        text not null,
  target      text,
  source      text not null default 'Direct',
  referrer    text,
  campaign    text,
  country     text,
  region      text,
  city        text,
  device      text,
  browser     text,
  os          text,
  visitor     text not null,
  session     text,
  depth       smallint check (depth between 0 and 100),
  seconds     integer check (seconds between 0 and 3600)
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);

-- Server-only, like subscribers: RLS on and no policies, so the public anon key can't read or write it.
alter table public.page_views enable row level security;

-- Explicit grants: only the service role (server) can touch these tables; the public API roles get nothing.
revoke all on public.subscribers, public.page_views from anon, authenticated;
grant select, insert, update, delete on public.subscribers, public.page_views to service_role;

-- Settings the owner edits in /admin/settings (donation links, community link, contact email, socials).
-- One row, key 'site'. The app validates every value again when it reads it.
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Security log: admin sign-ins (good and failed) and every settings change, with what changed.
create table if not exists public.admin_audit (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  action      text not null check (char_length(action) <= 60),
  detail      jsonb,
  ip          text
);

create index if not exists admin_audit_created_idx on public.admin_audit (created_at desc);

alter table public.site_settings enable row level security;
alter table public.admin_audit enable row level security;
revoke all on public.site_settings, public.admin_audit from anon, authenticated;
grant select, insert, update, delete on public.site_settings, public.admin_audit to service_role;

-- Blog posts written in /admin/posts. Posts in src/content/posts/*.md keep working; a database post
-- with the same slug as a file is ignored. site_settings also holds key 'daily_words' after the first edit in /admin/words.
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title       text not null check (char_length(title) between 1 and 160),
  excerpt     text not null check (char_length(excerpt) <= 400),
  category    text not null check (char_length(category) <= 60),
  image       text not null check (char_length(image) <= 400),
  book        text check (char_length(book) <= 40),
  body        text not null check (char_length(body) <= 60000),
  published   boolean not null default false,
  date        date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists posts_published_date_idx on public.posts (published, date desc);

alter table public.posts enable row level security;
revoke all on public.posts from anon, authenticated;
grant select, insert, update, delete on public.posts to service_role;

-- Public bucket for blog images uploaded from /admin/posts. Anyone can view; only the server (service role) can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
