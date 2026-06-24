import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

const DEFAULT_CENTER = [37.5665, 126.9780]

function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true, duration: 0.5 })
  }, [center, map])
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

export default function WalkMap({ route, currentPos, eventPins, dogPhoto, dogName, pinEmoji, started }) {
  const center = currentPos ? [currentPos.lat, currentPos.lng] : DEFAULT_CENTER

  const dogIcon = useMemo(
    () => createDogIcon(dogPhoto, dogName, pinEmoji),
    [dogPhoto, dogName, pinEmoji]
  )

  return (
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

      {route.length >= 2 && (
        <Polyline
          positions={route.map(p => [p.lat, p.lng])}
          color="#356A57"
          weight={5}
          opacity={0.88}
          lineCap="round"
          lineJoin="round"
        />
      )}

      {eventPins.map(p => (
        <Marker key={p.key} position={[p.pos.lat, p.pos.lng]} icon={createEventIcon(p.emoji)} />
      ))}

      {started && currentPos && (
        <Marker position={[currentPos.lat, currentPos.lng]} icon={dogIcon} />
      )}
    </MapContainer>
  )
}
