import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

const DEFAULT_CENTER = [37.5665, 126.9780]
const TAIL_LEN = 18

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true, duration: 0.5 })
  }, [center, map])
  return null
}

function MapRefSetter({ mapRef }) {
  const map = useMap()
  useEffect(() => { mapRef.current = map }, [map, mapRef])
  return null
}

function createDogIcon(dogPhoto, dogName, emoji) {
  const inner = dogPhoto
    ? `<img src="${dogPhoto}" class="dp-img" alt="dog" />`
    : `<span class="dp-txt">${dogName}</span>`

  const bubble = emoji
    ? `<div class="dp-bubble">${emoji}</div>`
    : ''

  return L.divIcon({
    className: '',
    html: `<div class="dp-wrap${emoji ? ' dp-bounce' : ''}">
      ${bubble}
      <div class="dp-circle">${inner}</div>
      <div class="dp-tail"></div>
    </div>`,
    iconSize: [56, 74],
    iconAnchor: [28, 74],
  })
}

function createEventIcon(emoji) {
  return L.divIcon({
    className: '',
    html: `<span class="dp-event">${emoji}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// 내 위치 SVG
function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }}>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="1.5" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="1.5" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function WalkMap({ route, currentPos, eventPins, dogPhoto, dogName, pinEmoji, started }) {
  const center = currentPos ? [currentPos.lat, currentPos.lng] : DEFAULT_CENTER
  const mapRef = useRef(null)

  const dogIcon = useMemo(
    () => createDogIcon(dogPhoto, dogName, pinEmoji),
    [dogPhoto, dogName, pinEmoji]
  )

  const mainRoute = useMemo(() => route.map(p => [p.lat, p.lng]), [route])
  const tailRoute = useMemo(() => route.slice(-TAIL_LEN).map(p => [p.lat, p.lng]), [route])

  function handleLocate() {
    if (currentPos && mapRef.current) {
      mapRef.current.flyTo([currentPos.lat, currentPos.lng], 17, { duration: 0.8 })
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={17}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="wt-tile-layer"
        />
        <MapController center={currentPos ? [currentPos.lat, currentPos.lng] : null} />
        <MapRefSetter mapRef={mapRef} />

        {/* 경로 글로우 (하단 레이어) */}
        {mainRoute.length >= 2 && (
          <Polyline
            positions={mainRoute}
            pathOptions={{ color: '#356A57', weight: 14, opacity: 0.1 }}
          />
        )}

        {/* 경로 메인 라인 */}
        {mainRoute.length >= 2 && (
          <Polyline
            positions={mainRoute}
            pathOptions={{ color: '#356A57', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {/* 경로 꼬리 — 최근 구간 펄스 애니메이션 */}
        {started && tailRoute.length >= 2 && (
          <Polyline
            positions={tailRoute}
            pathOptions={{ color: '#4A9470', weight: 5, opacity: 1, className: 'wt-route-tail', lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {eventPins.map(p => (
          <Marker key={p.key} position={[p.pos.lat, p.pos.lng]} icon={createEventIcon(p.emoji)} />
        ))}

        {started && currentPos && (
          <Marker position={[currentPos.lat, currentPos.lng]} icon={dogIcon} />
        )}
      </MapContainer>

      {/* 내 위치 버튼 */}
      <button
        className={`dp-locate${!currentPos ? ' disabled' : ''}`}
        onClick={handleLocate}
        title="내 위치로"
        aria-label="내 위치로"
      >
        <LocateIcon />
      </button>
    </div>
  )
}
