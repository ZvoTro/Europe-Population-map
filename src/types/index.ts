export interface GridCell {
  grd_id:     string
  cntr_id:    string
  ctry_name:  string
  tot_p_2011: number
  tot_p_2021: number
  pct_change: number
}

export interface CountryStat {
  cntr_id:    string
  ctry_name:  string
  pop_2011:   number
  pop_2021:   number
  pct_change: number
  cells:      number
}
