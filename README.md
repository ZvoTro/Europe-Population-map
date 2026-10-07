# European Population Change Map (2011 → 2021)

Interactive web map of population change across Europe on a 10 km grid, comparing the 2011 and 2021 censuses. Pan and zoom to see where people moved in and where regions emptied out; click a cell for its numbers, or pick a country in the sidebar.

<!-- Add a screenshot here: ![Map screenshot](docs/screenshot.png) -->
<!-- Live demo: https://your-deployment.vercel.app -->

## Features
- Choropleth of % population change per 10 km grid cell, with a colour legend
- Loads only the cells in the visible map area (bounding-box query), so the map stays fast at any zoom
- Click a cell for 2011 population, 2021 population and % change
- Sidebar with per-country totals and change, searchable and clickable to focus a country

## Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Map:** MapLibre GL with a CARTO light basemap
- **Backend:** Supabase (Postgres + PostGIS), two SQL functions called over RPC:
  - `get_grid_in_bbox(xmin, ymin, xmax, ymax)` returns the grid cells in view as GeoJSON
  - `get_country_stats()` returns per-country summary statistics

## Data
Eurostat census population grid (GEOSTAT), 2011 and 2021, aggregated to 10 km cells. The raw data is not included in this repo; load it into the `population_grid` table (columns: `grd_id`, `cntr_id`, `ctry_name`, `tot_p_2011`, `tot_p_2021`, `pct_change`, `geom` in EPSG:4326).

## Run it locally
1. Create a free Supabase project, open **SQL Editor**, and run `supabase_setup.sql` (enables PostGIS, creates the table, indexes and the two functions).
2. Load the population grid into `population_grid`.
3. Copy `.env.example` to `.env` and fill in your project URL and anon key:
