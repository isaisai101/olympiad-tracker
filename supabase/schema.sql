-- ============================================================
-- Olympiad Attendance Tracker — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ──────────────────
create table profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  name      text not null,
  role      text not null default 'teacher' check (role in ('teacher', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'teacher')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Subjects ────────────────────────────────────────────────
create table subjects (
  id          text primary key,
  name        text not null,
  color       text not null default '#6B5CE7',
  bg          text not null default 'rgba(107,92,231,0.12)',
  icon        text not null default '📚',
  teacher     text,
  schedule    text,
  created_at  timestamptz default now()
);

-- Seed default subjects
insert into subjects (id, name, color, bg, icon, teacher, schedule) values
  ('math',    'Mathematics', '#E8B84B', 'rgba(232,184,75,0.12)',   '∑',  'Aigerim Satkali',  'Mon & Wed, 16:00–17:30'),
  ('physics', 'Physics',     '#5B9BF8', 'rgba(91,155,248,0.12)',   '⚛',  'Zulfiya Amirova',  'Tue & Thu, 15:30–17:00'),
  ('chem',    'Chemistry',   '#34D399', 'rgba(52,211,153,0.12)',   '⚗',  'Samat Bekov',      'Wed & Fri, 16:00–17:30'),
  ('bio',     'Biology',     '#F97316', 'rgba(249,115,22,0.12)',   '🧬', 'Asel Nurmanova',   'Mon & Thu, 16:30–18:00'),
  ('cs',      'Informatics', '#A78BFA', 'rgba(167,139,250,0.12)', '⌨',  'Bolat Ergaliev',   'Tue & Sat, 15:00–17:00');

-- ── Students ────────────────────────────────────────────────
create table students (
  id          serial primary key,
  name        text not null,
  grade       text not null,
  subject_id  text references subjects(id) on delete set null,
  email       text,
  streak      int not null default 0,
  joined_date date not null default current_date,
  created_at  timestamptz default now()
);

-- ── Sessions ────────────────────────────────────────────────
create table sessions (
  id          text primary key default ('sess-' || extract(epoch from now())::bigint || '-' || floor(random()*1000)::int),
  subject_id  text references subjects(id) on delete cascade,
  date        date not null,
  time        text,
  topic       text,
  note        text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ── Attendance ──────────────────────────────────────────────
create table attendance (
  id          serial primary key,
  session_id  text references sessions(id) on delete cascade,
  student_id  int references students(id) on delete cascade,
  status      text not null check (status in ('present', 'late', 'absent')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(session_id, student_id)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger attendance_updated_at
  before update on attendance
  for each row execute procedure update_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table profiles   enable row level security;
alter table subjects   enable row level security;
alter table students   enable row level security;
alter table sessions   enable row level security;
alter table attendance enable row level security;

-- Profiles: users can read all, update only their own
create policy "Anyone can read profiles"   on profiles for select using (true);
create policy "Users update own profile"   on profiles for update using (auth.uid() = id);

-- Subjects: authenticated users can read; admins can write
create policy "Anyone can read subjects"   on subjects for select using (true);
create policy "Auth users can write subjects" on subjects for all using (auth.role() = 'authenticated');

-- Students: authenticated users can do everything
create policy "Auth users manage students" on students for all using (auth.role() = 'authenticated');

-- Sessions: authenticated users can do everything
create policy "Auth users manage sessions" on sessions for all using (auth.role() = 'authenticated');

-- Attendance: authenticated users can do everything
create policy "Auth users manage attendance" on attendance for all using (auth.role() = 'authenticated');

-- ── Useful views ────────────────────────────────────────────

-- Attendance rate per student per subject
create view student_attendance_stats as
select
  s.id as student_id,
  s.name as student_name,
  s.subject_id,
  count(a.id) as total_sessions,
  count(case when a.status = 'present' then 1 end) as present_count,
  count(case when a.status = 'late'    then 1 end) as late_count,
  count(case when a.status = 'absent'  then 1 end) as absent_count,
  round(
    (count(case when a.status = 'present' then 1 end) + 
     count(case when a.status = 'late'    then 1 end) * 0.5)
    / nullif(count(a.id), 0) * 100
  ) as attendance_rate
from students s
left join sessions sess on sess.subject_id = s.subject_id
left join attendance a on a.session_id = sess.id and a.student_id = s.id
group by s.id, s.name, s.subject_id;
