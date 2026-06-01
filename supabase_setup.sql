-- Run this entire file in Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- 1. Enable PostGIS (if not already)
create extension if not exists postgis;

-- 2. Grid table
create table if not exists population_grid (
  id          bigserial primary key,
  grd_id      text,
  cntr_id     text,
  ctry_name   text,
  tot_p_2011  float,
  tot_p_2021  float,
  pct_change  float,
  geom        geometry(Polygon, 4326)
);
create index if not exists idx_pop_grid_geom on population_grid using gist(geom);
create index if not exists idx_pop_grid_cntr on population_grid (cntr_id);

-- 3. RPC: returns a GeoJSON FeatureCollection for the visible bbox
create or replace function get_grid_in_bbox(
  xmin float, ymin float, xmax float, ymax float
)
returns json
language sql stable security definer as $$
  select json_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(json_agg(
      json_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(geom)::json,
        'properties', json_build_object(
          'grd_id',      grd_id,
          'cntr_id',     cntr_id,
          'ctry_name',   ctry_name,
          'tot_p_2011',  tot_p_2011,
          'tot_p_2021',  tot_p_2021,
          'pct_change',  pct_change
        )
      )
    ), '[]'::json)
  )
  from population_grid
  where ST_Intersects(
    geom,
    ST_MakeEnvelope(xmin, ymin, xmax, ymax, 4326)
  )
$$;

-- 4. RPC: per-country summary stats (used by the sidebar table)
create or replace function get_country_stats()
returns table (
  cntr_id    text,
  ctry_name  text,
  pop_2011   float,
  pop_2021   float,
  pct_change float,
  cells      bigint
)
language sql stable security definer as $$
  select
    cntr_id,
    max(ctry_name)                                              as ctry_name,
    sum(tot_p_2011)                                             as pop_2011,
    sum(tot_p_2021)                                             as pop_2021,
    (sum(tot_p_2021) - sum(tot_p_2011))
      / nullif(sum(tot_p_2011), 0) * 100                       as pct_change,
    count(*)                                                    as cells
  from population_grid
  where tot_p_2011 is not null
    and tot_p_2021 is not null
    and cntr_id not like '%-%'          -- skip cross-border cells
  group by cntr_id
  order by pct_change
$$;

-- 5. Allow anonymous read via RLS (Supabase auto-enables RLS)
alter table population_grid enable row level security;
create policy "public read"
  on population_grid for select using (true);
