import { useEffect, useRef, useCallback, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { fetchGridInBbox } from '../lib/supabase'
import { colourExpression } from '../lib/colours'
import { GridCell } from '../types'
import CellPopup from './CellPopup'

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

interface Props {
  activeCntr: string | null
}

export default function MapView({ activeCntr }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<maplibregl.Map | null>(null)
  const popupRef     = useRef<maplibregl.Popup | null>(null)
  const loadingRef   = useRef(false)

  const [popupCell, setPopupCell]   = useState<GridCell | null>(null)
  const [popupLngLat, setPopupLngLat] = useState<[number, number] | null>(null)
  const [mapReady, setMapReady]     = useState(false)

  // ── initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CartoDB © OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'carto-bg', type: 'raster', source: 'carto' }],
      },
      center: [15, 54],
      zoom: 4,
      minZoom: 3,
      maxZoom: 14,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    map.on('load', () => {
      // ── grid fill layer ────────────────────────────────────────────────
      map.addSource('grid', { type: 'geojson', data: EMPTY_FC })

      map.addLayer({
        id:     'grid-fill',
        type:   'fill',
        source: 'grid',
        paint: {
          'fill-color':   colourExpression,
          'fill-opacity': 0.82,
        },
      })

      map.addLayer({
        id:     'grid-hover',
        type:   'fill',
        source: 'grid',
        paint: {
          'fill-color':   '#ffffff',
          'fill-opacity': [
            'case', ['boolean', ['feature-state', 'hover'], false], 0.25, 0,
          ],
        },
      })

      // ── hover effect ───────────────────────────────────────────────────
      let hoveredId: string | number | undefined
      map.on('mousemove', 'grid-fill', e => {
        map.getCanvas().style.cursor = 'pointer'
        if (e.features?.length) {
          if (hoveredId !== undefined)
            map.setFeatureState({ source: 'grid', id: hoveredId }, { hover: false })
          hoveredId = e.features[0].id
          map.setFeatureState({ source: 'grid', id: hoveredId! }, { hover: true })
        }
      })
      map.on('mouseleave', 'grid-fill', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredId !== undefined)
          map.setFeatureState({ source: 'grid', id: hoveredId }, { hover: false })
        hoveredId = undefined
      })

      // ── click → popup ──────────────────────────────────────────────────
      map.on('click', 'grid-fill', e => {
        if (!e.features?.length) return
        const props = e.features[0].properties as GridCell
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat]
        setPopupCell(props)
        setPopupLngLat(lngLat)
      })

      setMapReady(true)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // ── load grid data for current viewport ─────────────────────────────────
  const loadGrid = useCallback(async () => {
    const map = mapRef.current
    if (!map || loadingRef.current) return
    loadingRef.current = true

    try {
      const b    = map.getBounds()
      const fc   = await fetchGridInBbox(
        b.getWest(), b.getSouth(), b.getEast(), b.getNorth()
      )
      const src  = map.getSource('grid') as maplibregl.GeoJSONSource | undefined
      if (src) src.setData(fc)
    } catch (err) {
      console.error('fetchGridInBbox:', err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  // ── wire map events once map is ready ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    map.on('moveend', loadGrid)
    map.on('zoomend', loadGrid)
    loadGrid()   // initial load
    return () => { map.off('moveend', loadGrid); map.off('zoomend', loadGrid) }
  }, [mapReady, loadGrid])

  // ── filter by active country ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    const filter = activeCntr
      ? ['==', ['get', 'cntr_id'], activeCntr]
      : null
    map.setFilter('grid-fill',  filter)
    map.setFilter('grid-hover', filter)
  }, [activeCntr, mapReady])

  // ── close popup ──────────────────────────────────────────────────────────
  const closePopup = () => { setPopupCell(null); setPopupLngLat(null) }

  return (
    <div className="relative flex-1 h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* React-rendered popup anchored via MapLibre Popup container */}
      {popupCell && popupLngLat && (
        <PopupAnchor
          map={mapRef.current!}
          lngLat={popupLngLat}
          onClose={closePopup}
        >
          <CellPopup cell={popupCell} onClose={closePopup} />
        </PopupAnchor>
      )}
    </div>
  )
}

// ── tiny helper: mounts a React node inside a MapLibre Popup ──────────────
import { createPortal } from 'react-dom'
import { ReactNode } from 'react'

function PopupAnchor({
  map, lngLat, children, onClose,
}: {
  map: maplibregl.Map
  lngLat: [number, number]
  children: ReactNode
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(document.createElement('div'))
  const popupRef2    = useRef<maplibregl.Popup | null>(null)

  useEffect(() => {
    const popup = new maplibregl.Popup({ closeButton: false, maxWidth: '280px' })
      .setLngLat(lngLat)
      .setDOMContent(containerRef.current)
      .addTo(map)
    popup.on('close', onClose)
    popupRef2.current = popup
    return () => { popup.remove() }
  }, [map, lngLat, onClose])

  return createPortal(children, containerRef.current)
}
