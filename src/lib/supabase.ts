import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env and fill in your Supabase credentials.'
  )
}

export const supabase = createClient(url, key)

/** Fetch GeoJSON FeatureCollection for cells in the given bbox */
export async function fetchGridInBbox(
  xmin: number, ymin: number, xmax: number, ymax: number
): Promise<GeoJSON.FeatureCollection> {
  const { data, error } = await supabase.rpc('get_grid_in_bbox', {
    xmin, ymin, xmax, ymax,
  })
  if (error) throw error
  return data as GeoJSON.FeatureCollection
}

/** Fetch per-country summary statistics */
export async function fetchCountryStats() {
  const { data, error } = await supabase.rpc('get_country_stats')
  if (error) throw error
  return data
}
