create table if not exists users(id integer primary key autoincrement, username text unique, pw text);
create table if not exists devices(id integer primary key autoincrement, dev_id text unique, secret_hash text,
  claim text, owner integer, name text default 'دستگاه من', tz text, t real, h real,
  seen integer default 0, relays text default '00000', rnames text default '');
create table if not exists schedules(id integer primary key autoincrement, device integer, relay integer,
  days text, t_on text, t_off text, last_active integer default 0);
create table if not exists hits(k text, ts integer);
create index if not exists hits_k on hits(k, ts);
create index if not exists dev_owner on devices(owner);
create index if not exists sch_dev on schedules(device);
