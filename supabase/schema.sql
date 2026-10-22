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
