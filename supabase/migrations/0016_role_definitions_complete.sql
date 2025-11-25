-- 0015_role_definitions_complete.sql
-- Complete role definitions for all platforms and event roles

insert into role_definitions (code, platform, description, level, hierarchy_rank) values
  ('FINANCE_ADMIN','atlvs','Finance administrator','admin',4),
  ('WORKFORCE_MANAGER','atlvs','Workforce manager','manager',3),
  ('PROCUREMENT_MANAGER','atlvs','Procurement manager','manager',3),
  ('COMPVSS_COLLABORATOR','compvss','External collaborator','member',2),
  ('GVTEWAY_EXPERIENCE_CREATOR','gvteway','Experience creator','manager',3),
  ('GVTEWAY_VENUE_MANAGER','gvteway','Venue manager','manager',3),
  ('GVTEWAY_ARTIST_VERIFIED','gvteway','Verified artist','member',2),
  ('GVTEWAY_ARTIST','gvteway','Artist','member',2),
  ('GVTEWAY_MEMBER_EXTRA','gvteway','Member Extra tier','member',2),
  ('GVTEWAY_MEMBER_PLUS','gvteway','Member Plus tier','member',2),
  ('GVTEWAY_MEMBER_GUEST','gvteway','Guest member','member',1),
  ('GVTEWAY_AFFILIATE','gvteway','Affiliate','member',2),
  ('GVTEWAY_MODERATOR','gvteway','Content moderator','manager',3),
  ('LEGEND_COLLABORATOR','legend','External collaborator','god',5),
  ('LEGEND_INCOGNITO','legend','Stealth mode','god',5)
on conflict (code) do update set
  platform = excluded.platform,
  description = excluded.description,
  level = excluded.level,
  hierarchy_rank = excluded.hierarchy_rank;
